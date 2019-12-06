var express = require("express");
var router = express.Router();
var User = require("../models/userModel");

// Functions modified from tutorial by Frank Atukunda:
// https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122

/**
 * Logs a user in (or creates a new user)
 */
router.post("/login", async (req, res) => {
  // Check if the user is new or existing
  if (req.body.newUser === true) {
    console.log("Adding new user");
    // Create a new user
    try {
      // Check if user with that name already exists
      const duplicate = await User.userExists(req.body.username);
      if (duplicate) {
        throw new Error("User already exists");
      }

      // Create the new user
      const user = new User({
        name: req.body.username,
        password: req.body.password
      });

      // Save the new user to the database
      await user.save();

      // Generate an access token for the user
      const token = await user.generateAuthToken();
      res.status(201);

      // Return the token so it can be saved on the client side
      res.send(token);
    } catch (error) {
      console.log(error);
      res.status(400);
      res.send();
    }
  } else {
    console.log("Trying to log an existing user in");
    // Log in a registered user
    try {
      // Find a user with the name and password in the request body
      const name = req.body.username;
      const password = req.body.password;
      const user = await User.findByCredentials(name, password);
      if (!user) {
        // If no user was found with that name, return an error
        console.log("User doesn't exist");
        res.status(401);
        res.send();
      }

      // Generate a new token for the user
      const token = await user.generateAuthToken();
      console.log("Logged in user successfully");

      // Return the token so it can be saved on the client side
      res.send(token);
    } catch (error) {
      // If the password was incorrect, return an error
      console.log(error);
      console.log("Invalid password for user");
      res.status(400);
      res.send();
    }
  }
});

/**
 * Gets the name of a user based on the access token
 */
router.get("/:token", async (req, res) => {
  console.log("Finding user by token");
  const user = await User.findByToken(req.params.token);
  // console.log("Result");
  // console.log(user);
  if (!user) {
    // If no user was found for the token, return a not found status
    console.log("User not found for token");
    res.status(404).send();
  }
  // Return the name of the user that was found
  res.send(user.name);
});

/**
 * Logs a user out by deleting the user's current token from the database
 */
router.delete("/logout", async (req, res) => {
  // Find the user to delete based on the token in the body
  const user = await User.findByToken(req.body.token);
  try {
    // Remove the token from the user's array of tokens
    user.tokens = user.tokens.filter(token => {
      return token.token != req.body.token;
    });
    // Update the user in the database
    await user.save();
    console.log("User updated successfully");
    res.status(200);
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
