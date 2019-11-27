var express = require('express');
var router = express.Router();
var Task = require('../models/task');

/* GET users listing. */
router.post('/', function(req, res, next) {
  var task = new Task(
        { 
            name: req.body.toDoItem,
            location: req.body.toDoLocation 
        }
    )
  task.save(function (err) {
    // if (err) { return next(err); }
      // res.redirect('index.html');
  })

  //console.log(req.body);
  res.send('Got a new item to do...');
});
router.get('/list', function(req, res, next) {
  res.send('Here is a list of stuff...');
});


module.exports = router;
