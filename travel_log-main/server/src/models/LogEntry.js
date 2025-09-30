const mongoose = require('mongoose');

const { Schema } = mongoose; 

const logEntrySchema =  new Schema ({
    title: {
        type :  String ,
        required : true,
    } ,
    description : String ,
    comments : String,
    image: String,
    rating : {
        type : Number, 
        min : 0,
        max : 10,
        default : 0,
    },
    latitude :  {
        type : Number, 
        required : true,
        min : -90,
        max :90,
    },
    longitude : {
        type : Number, 
        required : true,
        min : -180,
        max :180,
    },
    // User information
    userId: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    created_at  : {
        type : Date , 
        default : Date.now,
        required : true,
    },
    updated_at  : {
        type : Date , 
        default : Date.now,
        required : true,
    },
    visitDate : {
        type : Date, 
        required  :true,
    }
},{
    timestamps : true,
});

const logEntry = mongoose.model('LogEntry', logEntrySchema);

module.exports = logEntry;