const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

const checkDuplicateusernameOrEmail = (req, res, next) => {
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    if (user) {
      res.status(200).send({ message: "Failed! username is already in use!", status: "errors" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(200).send({ message: err, status: "errors" });
        return;
      }

      if (user) {
        res.status(200).send({ message: "Failed! Email is already in use!", status: "errors" });
        return;
      }

      next();
    });
  });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.role) {
    if (!ROLES.includes(req.body.role)) {
      res.status(200).send({ message: `Failed! Role ${req.body.role} does not exist!`, status: "errors" });
      return;
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateusernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
