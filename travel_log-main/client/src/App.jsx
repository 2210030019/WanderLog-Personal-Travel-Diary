import * as React from 'react';
import { useState , useEffect} from 'react';
import ReactMapGL ,{ Marker , Popup } from 'react-map-gl';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { listLogEntries } from './API.jsx';
import LogEntryForm from './logEntryForm.jsx';
import { FlyToInterpolator } from 'react-map-gl';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LoginButton from './components/LoginButton.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import './App.css';

const MapComponent = () => {
  const { isAuthenticated } = useAuth();
  const token = process.env.REACT_APP_MAPBOX_TOKEN;
  const [logEntries , setLogEntries] = useState([]);
  const [showPopup , setShowPopup] = useState({});
  const [addEntryLocation , setAddEntryLocation] = useState(null);
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 37.6,
    longitude: -95.665,
    zoom: 5,
    bearing: 0,
    pitch: 0
  });

  const getEntries = async ()=> {
    const logEntries = await listLogEntries();
    setLogEntries(logEntries);
  }

  useEffect(()=>{
    getEntries();
  }, []);

  // Refresh entries when authentication status changes
  useEffect(() => {
    getEntries();
    // Clear any open popups when auth status changes
    setShowPopup({});
    // Clear add entry location when logging out
    if (!isAuthenticated) {
      setAddEntryLocation(null);
    }
  }, [isAuthenticated]);

  const showAddMarkerPopup = (event) => {
    if (!isAuthenticated) {
      alert('Please login to add entries');
      return;
    }
    
    const [ longitude , latitude ] =event.lngLat;
    setAddEntryLocation ({
      latitude, 
      longitude,
    }) 
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Login/User info overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <LoginButton />
      </div>

      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={token}
        onDblClick={showAddMarkerPopup}
        mapStyle ='mapbox://styles/mapbox/streets-v12'
        onViewportChange={nextViewport => setViewport(nextViewport)}
        dragPan={true}
        dragRotate={false}
        scrollZoom={true}
        touchZoom={true}
        touchRotate={false}
        keyboard={true}
        doubleClickZoom={false}
        minZoom={1}
        maxZoom={20}
        touchZoomRotate={true}
        attributionControl={false}
      >
        {logEntries.map( entry => {
          return(
          <>
           <Marker
            key = {entry._id}
            latitude={entry.latitude}
            longitude={entry.longitude}
            offsetLeft={-20}
            offsetTop={-10}
          >

           <div onClick={()=> {
            setShowPopup(
              {
                [entry._id] :true,
              }
            )
           }}>
            <img 
              className='marker'
              style={{
                width: `${4* viewport.zoom}px`,
                height : `${4* viewport.zoom}px`,
              }}
              src="https://i.imgur.com/y0G5YTX.png" 
              alt="marker"
            />
           </div>
          </Marker>
          {  showPopup[entry._id] ? (
          <Popup
            latitude={entry.latitude}
            longitude={entry.longitude}
            closeButton={true}
            closeOnClick={false}
            dynamicPosition={true}
            sortByDepth={true}
            onClose={() => setShowPopup({})}
            anchor="top" >
            <div className='popup'> 
              <h5>{entry.title}</h5>
              <p>{entry.comments}</p>
              <div className='popup-image'>
              {entry.image && <img src={entry.image} alt={entry.title} style= {{height : '100px', width :'100px'}}/>}
              <small>Visited on: {new Date(entry.visitDate).toLocaleDateString()}</small>
              </div>
            </div>
           </Popup>
          ): null        
          }
          </>      
        )})}
        {
           addEntryLocation && isAuthenticated ? (
           <>
           <Marker
           latitude={addEntryLocation.latitude}
           longitude={addEntryLocation.longitude}
           offsetLeft={-20}
           offsetTop={-10}
         >

          <div>
           <img 
             className='marker'
             style={{
               width: `${4* viewport.zoom}px`,
               height : `${4* viewport.zoom}px`,
             }}
             src="https://i.imgur.com/y0G5YTX.png" 
             alt="marker"
           />
          </div>
         </Marker>
          <Popup
            latitude={addEntryLocation.latitude}
            longitude={addEntryLocation.longitude}
            closeButton={true}
            closeOnClick={false}
            dynamicPosition={true}
            sortByDepth={true}
            onClose={() => setAddEntryLocation(null)}
            anchor="top" >
            <div className='popup'> 
              <h3>Add your log Entry !</h3>
              <LogEntryForm location={addEntryLocation} onClose={() => {
                setAddEntryLocation(null);
                getEntries();
              }}/>
            </div> 
           </Popup>   
           </>):null
        }

      </ReactMapGL>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/auth/success" element={<AuthCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 
