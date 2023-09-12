const db = require("../models");
const User = db.user;
const Role = db.role;

exports.allUsers = (req, res) => {
  User.find()
    .populate('role')
    .exec((err, users) => {

      if (err) {
        res.status(200).send({ message: err });
        return;
      }

      if (!users) {
        return res.status(404).send({ message: "Orders Not found." });
      }

      return res.status(200).send(users);
    })
};


exports.getUser = (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate('role')
    .exec((err, user) => {

      if (err) {
        res.status(200).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "User Not found.", status: "errors" });
      }

      return res.status(200).send(user);
    })
};

exports.setRole = (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate('role')
    .exec((err, user) => {

      if (err) {
        res.status(200).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Orders Not found." });
      }

      Role
        .find({ name: req.params.role },
          (err, role) => {
            if (err) {
              return;
            }
            user.role = role._id;
            user.save(err => {
              if (err) {
                return;
              }
              User.findOne({ _id: user._id })
                .populate('role')
                .exec((err, fUser) => {
                  if (err) {
                    res.status(200).send({ message: err });
                    return;
                  }

                  if (!fUser) {
                    return res.status(404).send({ message: "Orders Not found." });
                  }
                  return res.status(200).json(fUser);
                })
            });

          }
        );
    })
};

exports.update = (req, res) => {
  User.findOne({ _id: req.userId })
    .populate('role')
    .exec(async (err, user) => {

      if (err) {
        res.status(200).send({ message: err, status: "errors" });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "User Not found.", status: "errors" });
      }

      user.username = req.body.username;
      
      user.save(err => {
        if (err) {
          return res.status(200).send({ message: err, status: "errors" });
        }
        return res.status(200).json({status: "success", data: user});
      });
    })
};

exports.delete = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .exec(() => {
      res.status(200).send("success");
    })
};


exports.checkVerification = (req, res) => {

  User.findOne({ _id: req.userId })
    .exec(async (err, user) => {

      if (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      if (!user) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      try {

        return res.status(200).send({ message: {
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }, status: "success" });
      } catch (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

    })
}


