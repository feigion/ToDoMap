var express = require("express");
var router = express.Router();
var User = require("../models/user");
var auth = require("../middleware/auth");

// Functions modified from tutorial by Frank Atukunda:
// https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122
router.post("/login", async (req, res) => {
  if (req.body.newUser) {
    console.log("Need to add new user");
    // TODO: add user to database
  } else {
    //Log in a registered user
    try {
      const name = req.body.username;
      const password = req.body.password;
      const user = await User.findByCredentials(name, password);
      if (!user) {
          // TODO: add error message on page
          res.status(401);
          res.redirect("../login.html");
      }
      const token = await user.generateAuthToken();
      console.log(token);
      res.redirect("../index.html");
    } catch (error) {
      res.status(400)
      // TODO: add error message to page
      res.redirect("../login.html");
    }
  }
});

router.get('/users/current', auth, async(req, res) => {
  // View logged in user profile
  res.send(req.user)
})

module.exports = router;
