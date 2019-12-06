var express = require('express');
var router = express.Router();
var Task = require('../models/taskModel');
var User = require('../models/userModel');

/**
 * Adds a new task to the database, using the information in the request body
 */
router.post('/', async (req, res, next) => {
  // Find the user based on the token in the body in order to get the name
  // of the user to include in the database for the task
  const user = await User.findByToken(req.body.token);
  var task = new Task(
        { 
            name: req.body.name,
            location: req.body.location,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            username: user.name
        }
    )
  // Save the new task to the database
  task.save(function (err) {
    if (err) { 
      console.log(err);
      // return next(err); 
    }
  })

  res.redirect("index.html");
});

/**
 *  Gets all tasks that are in the database (for all users)
 */ 
router.get('/list', function(req, res, next) {
  console.log("Getting all tasks");
  // Get all the tasks in the DB
  Task.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_tasks) {
      if (err) {return next(err); }
      // console.log(list_tasks);
      res.send(list_tasks);
    });
});

/**
 * Gets all tasks in the database for a particular user
 */
router.get('/list/:username', function(req, res, next) {
  console.log("Getting all tasks for user " + req.params.username);
  Task.find()
    .where({username: req.params.username})
    .sort([['name', 'ascending']])
    .exec(function(err, list_tasks) {
      if (err) {return next(err); }
      // console.log(list_tasks);
      res.send(list_tasks);
    });
});

/**
 * Gets the task from the database with the indicated name
 */
router.get('/task/:name', function(req, res, next) {
  let taskName = req.params.name;
  console.log("Getting task " + taskName);
  Task.find()
    .where({name: taskName})
    .exec(function(err, task_list) {
      if (err) {
        // return next(err); 
        console.log(err);
      }
      task = task_list[0];  // TODO: handle duplicate names
      console.log(task);
      res.send(JSON.stringify(task));
    });
});

/**
 * Removes a task from the database (when the user has completed it)
 */
router.delete('/task/:name', function(req, res, next) {
  let taskName = req.params.name;
  Task.findOneAndDelete()
    .where({name: taskName})
    .exec(function(err, task_list) {
      if (err) {
        // return next(err); 
        console.log(err);
      }
      res.send();
    });
});

module.exports = router;
