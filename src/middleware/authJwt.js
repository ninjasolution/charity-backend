const jwt = require("jsonwebtoken");
const settings = require("../config/settings");
const db = require("../models");
const User = db.user;
const Role = db.role;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(200).send({ message: "No token provided!", status: "errors" });
  }

  jwt.verify(token, settings.secret, (err, decoded) => {
    if (err) {
      return res.status(200).send({ message: "Unauthorized!", status: "errors" });
    }
    req.idUser = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findById(req.idUser).exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    Role.find(
      {
        _id: user.role
      },
      (err, role) => {
        if (err) {
          res.status(200).send({ message: err });
          return;
        }

        if (role.name === "admin") {
          next();
          return;
        }

        res.status(200).send({ message: "Require Admin Role!", status: "errors" });
        return;
      }
    );
  });
};

const isUser = (req, res, next) => {
  User.findById(req.idUser).exec((err, user) => {
    if (err) {
      res.status(200).send({ message: err, status: "errors" });
      return;
    }

    Role.find(
      {
        _id: user.role
      },
      (err, role) => {
        if (err) {
          res.status(200).send({ message: err, status: "errors" });
          return;
        }

        if (role.name === "user") {
          next();
          return;
        }

        res.status(200).send({ message: "Require user Role!", status: "errors" });
        return;
      }
    );
  });
};


const authJwt = {
  verifyToken,
  isAdmin,
  isUser
};
module.exports = authJwt;
