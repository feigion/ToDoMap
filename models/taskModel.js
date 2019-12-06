// Referenced the example here to write this: 
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Schema to represent a task in the database, including a name for the task, the
 * address, longitude, and latitude, along with the name of the user who
 * created the task
 */
var TaskSchema = new Schema(
    {
        name: {type: String, required: true},
        location: {type: String, required: true},
        latitude: {type: Number, required: true},
        longitude: {type: Number, required: true},
        username: {type: String, required: true}
    }
);

module.exports = mongoose.model('Task', TaskSchema);