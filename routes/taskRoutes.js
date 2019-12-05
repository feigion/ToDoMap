var express = require('express');
var router = express.Router();
var Task = require('../models/taskModel');

router.post('/', function(req, res, next) {
  console.log(req.body);
  // TODO: get username
  var task = new Task(
        { 
            name: req.body.toDoItem,
            location: req.body.toDoLocation,
            latitude: req.body.lat,
            longitude: req.body.lng,
            username: 'admin'
        }
    )
  task.save(function (err) {
    if (err) { 
      console.log(err);
      // return next(err); 
    }
  })
  console.log(task);

  res.redirect("index.html");
});

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

router.put('/update', function(req, res, next) {
  console.log("In update for " + req.body.name);
  Task.find()
    .where({name: req.body.name})  // Used https://mongoosejs.com/docs/api/query.html
    .exec(function(err, task_list) {
      if (err) {
        // return next(err); 
        console.log(err);
      }
      task = task_list[0];  // TODO: handle duplicate names
      console.log("Found: " + task.name);
      task.markerIndex = req.body.markerIndex;
      task.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
});

module.exports = router;
