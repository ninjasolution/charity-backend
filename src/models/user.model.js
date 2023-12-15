const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');

module.exports = (connection, autoIncrement) => {

  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      min: 3,
      max: 25
    },
    firstName: {
      type: String,
      min: 3,
      max: 25
    },
    lastName: {
      type: String,
      min: 3,
      max: 25
    },
    email: {
      type: String,
      unique: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      default: ""
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: "avatar.png"
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    changePasswordAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: Number,
      ref: "Role"
    },
    tokens: [
      {
        type: Number,
        ref: "Token"
      }
    ]
  })

  UserSchema.plugin(timestamps)
  UserSchema.plugin(autoIncrement.plugin, "User")

  const User = connection.model(
    "User",
    UserSchema
  );

  return User;
}
