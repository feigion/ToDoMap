var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  //console.log(req.body);
  res.send('Got a new item to do...');
});
router.get('/list', function(req, res, next) {
  res.send('Here is a list of stuff...');
});


module.exports = router;
