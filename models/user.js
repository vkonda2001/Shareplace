// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var UserSchema = new mongoose.Schema({
    firebaseId: {type: String, required: true},
    email: {type: String, required: true},    
    password: {type: String, required: true},
    username: {type: String, required: true},
    name: {type: String, required: true},
    profilePicturePath: {type: String, required: true},
    places: {type: [String], default: []},
    placesCount: {type: Number, default: 0},
    friends: {type: [String], default: []}
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);