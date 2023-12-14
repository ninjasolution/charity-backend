const db = require("../models");
const User = db.user;
const Role = db.role;
const Token = db.token;
const twilio = require('twilio');
const promisify = require('util.promisify');
const crypto = require("crypto")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const service = require("../service/index")

const { RES_MSG_DATA_NOT_FOUND, RES_STATUS_FAIL } = require("../config");

exports.signup = async (req, res) => {
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  try {

    user = await user.save();

    Role.findOne({ name: db.ROLES[0] }, (err, role) => {
      if (err) {
        return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
      }

      if (!role) {
        return res.status(404).send({ message: RES_MSG_DATA_NOT_FOUND, status: RES_STATUS_FAIL });
      }

      user.role = role._id;
      user.save(async (err, user) => {
        if (err) {
          return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        }
        return res.send(user);
      });
    }
    );
  } catch (err) {
    return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
  }

};

exports.signin = (req, res) => {
  console.log(req.body)
  User.findOne({
    email: req.body.email
  }).populate("role", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(200).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "Incorrect id or password", status: RES_STATUS_FAIL });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(200).send({ message: "Incorrect id or password", status: RES_STATUS_FAIL });
      }

      var token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        status: "success",
        token,
        expiresIn: 24*3600*1000,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          changePasswordAt: user.changePasswordAt,
          passwordtoken: user.resetPasswordToken,
          passwordtokenexp: user.resetPasswordExpires,
          role: user.role
        }
      });
    });
};

exports.verifyEmail = async (req, res) => {
  try {
    User.findOne({
      _id: req.params.id
    })
      .populate("tokens", "-__v")
      .exec(async (err, user) => {
        if (!user) return res.status(200).send({ message: "Not exist user", status: RES_STATUS_FAIL });
        if (user.emailVerified) {
          var token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, {
            expiresIn: 86400 // 24 hours
          });
          return res.status(200).send({
            status: "success",
            token,
            data: {
              _id: user._id,
              username: user.username,
              email: user.email,
              emailVerified: user.emailVerified,
              phoneVerified: user.phoneVerified,
              changePasswordAt: user.changePasswordAt,
              passwordtoken: user.resetPasswordToken,
              passwordtokenexp: user.resetPasswordExpires,
              role: user.role,
            }
          });
        }

        const tokens = await Token.find({
          user: req.params.id,
          type: "Email",
        });
        if (tokens.length === 0) return res.status(200).send({ message: "Token doesn't exist", status: RES_STATUS_FAIL });
        if (!tokens.map(t => t.token).includes(req.params.token)) {
          return res.status(200).send({ message: "Incorrect token", status: RES_STATUS_FAIL });
        }

        await User.updateOne({ _id: user._id }, { emailVerified: true });
        await Token.deleteMany({ _id: { $in: tokens.map(t => t._id) } });

        var token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, {
          expiresIn: 86400 // 24 hours
        });

        return res.status(200).send({
          status: "success",
          token,
          data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            changePasswordAt: user.changePasswordAt,
            passwordtoken: user.resetPasswordToken,
            passwordtokenexp: user.resetPasswordExpires,
            role: user.role,
          }
        });
      })


  } catch (error) {
    res.status(200).send({ message: "An error occured", status: RES_STATUS_FAIL });
  }
}

exports.verifyPhoneNumber = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(200).send({ message: "An error occured", status: RES_STATUS_FAIL });
    if (user.phoneVerified) return res.send({ message: "phone verified sucessfully", status: "success" });

    const token = await Token.findOne({
      user: user._id,
      type: "SMS",
      token: req.params.token,
    });
    if (!token) return res.status(200).send({ message: "An error occured", status: RES_STATUS_FAIL });

    await User.updateOne({ _id: user._id, phoneVerified: true });
    await Token.findByIdAndRemove(token._id);

    res.send({ message: "phone verified sucessfully", status: "success" });
  } catch (error) {
    res.status(200).send({ message: "An error occured", status: RES_STATUS_FAIL });
  }
}

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!",
      status: "success"
    });
  } catch (err) {
    res.status(200).send({ message: "An error occured", status: RES_STATUS_FAIL });
  }
};

exports.forgot = async (req, res, next) => {
  const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
  User.findOne({ email: req.body.email }, {}, async function (err, user) {
    if (err) {
      return res.status(500).send({ message: err, status: RES_STATUS_FAIL });
    }
    if (!user) {
      return res.status(404).send({ message: "There is no user with this email", status: RES_STATUS_FAIL });
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    user.save((err) => {
      if (!err) {
        service.resetPassword({ email: req.body.email, code: token }).then((result) => {
          return {
            message: "success",
          };
        });
      } else {
        return res.status(500).send({ message: err, status: RES_STATUS_FAIL });

      }
    })
  })
}

exports.reset = async (req, res) => {

  User.findOne({
    resetPasswordToken: req.params.token
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Incorrect token", status: RES_STATUS_FAIL });
      }

      if (!(user.resetPasswordExpires > Date.now())) {
        return res.status(400).send({ message: "Password reset token is invalid or has expired." });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = 0;

      user.save(async (err, rUser) => {
        if (err) {
          res.status(500).send({ message: err, status: RES_STATUS_FAIL });
          return;
        }
        return res.send({ message: `Success! Your password has been changed.`, status: RES_STATUS_FAIL });

      });
    })
}

exports.changePassword = (req, res) => {
  User.findOne({
    _id: req.userId
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Incorrect id", status: RES_STATUS_FAIL });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(400).send({ message: "password", status: RES_STATUS_FAIL });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.newPassword, saltRounds);

      user.password = hashedPassword
      user.changePasswordAt = Date.now();

      user.save(async (err) => {
        if (err) {
          res.status(500).send({ message: err, status: RES_STATUS_FAIL });
          return;
        }

        return res.status(200).send({
          status: RES_MSG_SUCESS,
          data: "Password is reseted!"
        });
      })
    });
};

exports.requestEmailVerify = (req, res) => {
  User.findOne({
    _id: req.userId
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Not exist user", status: RES_STATUS_FAIL });
      }

      let token = await new Token({
        user: user._id,
        type: "Email",
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      service.verifyAccount({email: user.email, token: token.token}).then(res => {
        return res.status(200).send({ message: "Sucess", status: RES_MSG_SUCESS });
      }).catch(err => {
        return res.status(500).send({ message: "Email send Fail", status: RES_MSG_SUCESS });
      })

    })
}


exports.requestPhoneVerify = (req, res) => {
  User.findOne({
    _id: req.userId
  })
    .populate("role", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(200).send({ message: err, status: RES_STATUS_FAIL });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "Incorrect token", status: RES_STATUS_FAIL });
      }

      await sendSMS(user);
      return res.status(200).send({ message: "Sucess", status: "success" });
    })
}


const sendSMS = async (user) => {
  try {
    const client = new twilio(process.env.SMS_ID, process.env.SMS_TOKEN);
    const code = getRandomInt(100000, 999999)

    await new Token({
      user: user._id,
      type: "SMS",
      token: code,
    }).save();

    await client.messages
      .create({
        body: `Mr-Tradly security code: ${code}`,
        to: user.phoneNumber, // Text this number
        from: process.env.PHONE_NUMBER, // From a valid Twilio number
      })

  } catch {
    return console.log("SMS server error");
  }

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
