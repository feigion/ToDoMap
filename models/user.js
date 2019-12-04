var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

// generateAuthToken and findByCredentials functions from tutorial here by Frank Atukunda:
// https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122
UserSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, "test"); //process.env.JWT_KEY)
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
UserSchema.statics.findByCredentials = async (name, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ name: name });
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
  throw new Error({ error: 'Invalid login credentials' })
  }
  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;