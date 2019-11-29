var express = require('express');
var router = express.Router();
var Task = require('../models/task');

router.post('/', function(req, res, next) {
  // TODO: calculate longitude and latitude from the address to use instead of placeholders below
  var task = new Task(
        { 
            name: req.body.toDoItem,
            location: req.body.toDoLocation,
            latitude: 45.5051, 
            longitude: -122.675,
            completed: false
        }
    )
  task.save(function (err) {
    // if (err) { return next(err); }
      // res.redirect('index.html');
  })
  console.log(task);

  res.redirect("smallmap.html");
});

router.get('/list', function(req, res, next) {
  // Get all the tasks in the DB
  Task.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_tasks) {
      if (err) {return next(err); }
      console.log(list_tasks);
      res.send(list_tasks);
    });
});


module.exports = router;
