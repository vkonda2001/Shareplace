// Load required packages
var mongoose = require('mongoose');

// Define our user schema
const PlaceSchema = mongoose.Schema({
    firebaseId: {type: String, required: true},
    userId: {type: String, required: true},
    name: {type: String, requried: true},
    description: {type: String, default: ""},
    placePicturePath: {type: String, required: true},
    likes: {type: [String], default: []},
    likesCount: {type: Number, default: 0},
    private: {type: Boolean, default: false},
    coordinates: {type: [Number], required: true},
    dateCreated: {type: Date} // set by server
});

// Export the Mongoose model
module.exports = mongoose.model('Place', PlaceSchema);