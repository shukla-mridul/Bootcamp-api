const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); /**Core module for generating and hashing token */
const JWT_SECRET =
  "dshfihaewuhfawehinsaijncjns0"; /**RANDOM STRING DONT THINK ABOUT IT  */
const JWT_EXPIRE = "30d";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false /**Will not return the password when user is calling the api  */,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt

UserSchema.pre("save", async function (next) {
  /**Now when we will do forgot password and save the reset password token this will  run and
   * give an error as we dont have password for the user in forgotpassword therefore we needd to get around that
   *
   */
  if (!this.isModified("password")) {
    next();
    /**This method tells the node that if there is not modified password just move to the next.....tbh i dont get this very much but ya whatever
     and the password will be encrypted if the password is modified only*/
  }
  const salt = await bcrypt.genSalt(
    10
  ); /**Here 10 is a round ,  more the rounds more secure is the psassword but  more 
heavier on the system */

  this.password = await bcrypt.hash(this.password, salt);
});

// Remeber its a model therefore it will be called on the instance of the actual model
// and not the on the model, for calling a function on the model itself we use statics
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};
// Generate and hash pasword  tokens

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto
    .randomBytes(20)
    .toString(
      "hex"
    ); /**This will return a buffer so we need to pass it to toString */

  // hash token and set to resetToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); /**sha256 is the algoritham to hash the password */

  // Set expiry date for the password
  this.resetPasswordExpire =
    Date.now() + 10 * 60 * 1000; /* expiration time is set 10 minutes */

  return resetToken;
};
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", UserSchema);
