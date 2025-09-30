const API_URL ='http://localhost:1337';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'content-type': 'application/json',
        ...(token && { 'authorization': `Bearer ${token}` })
    };
};

export async function listLogEntries(){
    const response = await fetch(`${API_URL}/api/logs`, {
        headers: getAuthHeaders()
    });
    return(response.json());
}

export async function createLogEntry(entry){
    const response = await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body : JSON.stringify(entry),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create log entry');
    }
    
    return(response.json());
}