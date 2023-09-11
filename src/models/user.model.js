const mongoose = require("mongoose");
var timestamps = require('mongoose-timestamp');

module.exports = (connection, autoIncrement) => {

  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
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
    phoneNumber: {
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
    city: {
      type: String,
      default: ""
    },
    country: {
      type: Object,
      default: {"value": "CH", "label": "Switzerland"}
    },
    zipCode: {
      type: String,
      default: ""
    },
    withdrawAddress: {
      type: String,
      length: 42,
      default: "",
    },
    evmPrivateKey: {
      type: String,
    },
    evmAddress: {
      type: String,
      length: 42
    },
    btcPrivateKey: {
      type: String,
    },
    btcAddress: {
      type: String,
    },
    apiKey: {
      type: String,
      default: ""
    },
    apiSecret: {
      type: String,
      default: ""
    },
    authCode: {
      type: String,
      default: ""
    },
    enabled: {
      type: Number,
      default: false
    },
    profit: {
      type: Number,
      default: 0
    },
    orderCents: {
      type: Number,
      default: 0
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    changePasswordAt: {
      type: Date,
      default: Date.now
    },
    referralCode: {
      type: String,
      default: ""
    },
    leaderCode: {
      type: String,
      default: ""
    },
    roles: [
      {
        type: Number,
        ref: "Role"
      }
    ],
    transactions: [
      {
        type: Number,
        ref: "Transaction"
      }
    ],
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
