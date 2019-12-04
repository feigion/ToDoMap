var express = require("express");
var router = express.Router();
var crypto = require("crypto");
var User = require("../models/user");

/* GET users listing. */
// router.get("/", function(req, res, next) {
  // res.send("respond with a resource");
// });

router.post("/login", function(req, res, next) {
  if (req.body.newUser != undefined) {
    console.log("Adding new user");
    // TODO: add user to db

    res.redirect("../index.html");
  } else {
    // Check if user is in the database and password is valid
    let username = req.body.username;
    let password = hash(req.body.password);
    console.log(username);
    console.log(password);
    User.find()
      .where({ username: username })
      .exec(function(err, user_list) {
        if (err) {
          // return next(err);
          console.log(err);
          res.send();
        }
        console.log("User list: ");
        console.log(user_list);
        if (user_list.length == 0) {
          // If user is not in the database, got back to the login page
          console.log("User not in database");
          res.redirect("../login.html");
        } else {
          let user = user_list[0];
          console.log(user);
          // If user exists, check the password
          if (password === user.password) {
            // Log user in if password is correct
            console.log("Correct password for user");

            // TODO: create session

            res.redirect("../index.html");
          } else {
            console.log("Incorrect password for user");
            res.redirect("../login.html");
          }
        }
      });
  }
});

// Hash function from: https://www.terlici.com/2014/09/07/express-user-auth.html
function hash(text) {
  return crypto
    .createHash("sha1")
    .update(text)
    .digest("base64");
}

module.exports = router;
