var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var Schema = mongoose.Schema;

/**
 * Schema for a user in the database
 */
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

/**
 * Finds a user in the database based on the token passed in as an argument
 * Returns the user entry from the database
 */
UserSchema.statics.findByToken = async(token) => {
  const user = await User.findOne({ 'tokens.token': token});
  return user;
};

/**
 * Checks if a user with the name passed in as an argument already exists in the database
 */
UserSchema.statics.userExists = async (name) => {
  console.log("Trying to find user: " + name);
  // Search for a user by name
  const user = await User.findOne({ name: name });
  console.log("user found:");
  console.log(user);
  if (!user) {
    return false;
  } else {
    return true;
  }
}

// Functions below are modified from the tutorial here by Frank Atukunda:
// https://medium.com/swlh/jwt-authentication-authorization-in-nodejs-express-mongodb-rest-apis-2019-ad14ec818122

/**
 * Generates a token for a user which will be used to authenticate the user to determine which tasks to display on the list/map
 */
UserSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({ _id: user._id }, "test"); //process.env.JWT_KEY)
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

/**
 * Finds a user in the database based on the name and password arguments
 */
UserSchema.statics.findByCredentials = async (name, password) => {
  console.log("Trying to find user: " + name);
  // Search for a user by name
  const user = await User.findOne({ name: name });
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  // Check if the password argument matches the password in the database
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  // Throw an error if the password doesn't match
  if (!isPasswordMatch) {
    throw new Error({ error: "Invalid login credentials" });
  }
  return user;
};

/**
 * Hash the password entered by the user, and save that value to the database instead of the plaintext password
 */
UserSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
