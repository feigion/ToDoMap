// Modified from example here: 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TaskSchema = new Schema(
    {
        name: {type: String, required: true},
        location: {type: String, required: true},
        latitude: {type: Number, required: true},
        longitude: {type: Number, required: true},
    }
);

module.exports = mongoose.model('Task', TaskSchema);