var express = require("express");
var router = express.Router();
var User = require("../models/userModel");

// Functions modified from tutorial by Frank Atukunda:
// https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122
router.post("/login", async (req, res) => {
  if (req.body.newUser === true) {
    // TODO: check if a user with that name already exists
    console.log("Adding new user");
    // Create a new user
    try {
      const user = new User({
        name: req.body.username,
        password: req.body.password
      });
      await user.save();
      const token = await user.generateAuthToken();
      res.status(201);
      res.send(token);
    } catch (error) {
      console.log(error);
      res.status(400);
      res.send();
    }
  } else {
    console.log("Trying to log an existing user in");
    //Log in a registered user
    try {
      const name = req.body.username;
      const password = req.body.password;
      const user = await User.findByCredentials(name, password);
      if (!user) {
        console.log("User doesn't exist");
        res.status(401);
        res.send();
      }
      const token = await user.generateAuthToken();
      console.log("Logged in user successfully");
      res.send(token);
    } catch (error) {
      console.log(error);
      console.log("Invalid password for user");
      res.status(400);
      res.send();
    }
  }
});

router.get("/:token", async (req, res) => {
  console.log("Finding user by token");
  const user = await User.findByToken(req.params.token);
  console.log("Result");
  console.log(user);
  if (!user) {
    console.log("User not found for token");
    res.header = 404;
    res.send();
  }
  res.send(user.name);
});

module.exports = router;
