const { requestBotAPI } = require("../helpers");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Transaction = db.transaction;
const axios = require("axios").default;

exports.allUsers = (req, res) => {
  User.find()
    .populate('roles')
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
    .populate('roles')
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
    .populate('roles')
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
          (err, roles) => {
            if (err) {
              return;
            }
            user.roles = roles.map(role => role._id);
            user.save(err => {
              if (err) {
                return;
              }
              User.findOne({ _id: user._id })
                .populate('roles')
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
  User.findOne({ _id: req.idUser })
    .populate('roles')
    .exec(async (err, user) => {

      if (err) {
        res.status(200).send({ message: err, status: "errors" });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "User Not found.", status: "errors" });
      }

      user.username = req.body.username;
      user.withdrawAddress = req.body.withdrawAddress;
      user.city = req.body.city;
      user.country = req.body.country;
      user.phoneNumber = req.body.phoneNumber;
      user.zipCode = req.body.zipCode;
      user.apiKey = req.body.apiKey;
      user.apiSecret = req.body.apiSecret;
      if (req.body.apiKey) {
        user.apiKey = req.body.apiKey;
        user.apiSecret = req.body.apiSecret;
        try {
          var data = JSON.stringify({
            // idUser: req.body._id,
            idUser: 2250,
            apiKey: req.body.apiKey,
            apiSecret: req.body.apiSecret,
            enabled: user.enabled,
            // authCode: user.authCode,
            profit: user.profit,
            order_cents: user.orderCents,
            authCode: "1ee9394573062b6dbe275d9c570d52f4"
          });

          await requestBotAPI("put", "user", data)

        } catch (err) {
          return res.status(200).send({ message: err, status: "errors" });
        }
      }

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

exports.getStats = (req, res) => {

  User.findOne({ _id: req.params.id })
    .populate('roles')
    .exec(async (err, user) => {

      if (err) {
        return res.status(200).send({ message: err });
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found.", status: "errors" });
      }

      var resStats;
      try {
        resStats = await axios.post(`${process.env.BOT_API}/api/stats`, {
          // idUser: req.idUser,
          idUser: 2250,
          authCode: "1ee9394573062b6dbe275d9c570d52f4",
          // authCode: user.authCode
        })
      } catch (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      return res.status(200).send({ data: resStats.data, status: "errors" });
    })
}

exports.getCSV = (req, res) => {

  User.findOne({ _id: req.params.id })
    .populate('roles')
    .exec(async (err, user) => {

      if (err) {

        return res.status(200).send({ message: err, status: "errors" });
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found.", status: "errors" });
      }

      var resStats;
      try {
        resStats = await axios.post(`${process.env.BOT_API}/api/csv`, {
          idUser: 2250,
          authCode: "1ee9394573062b6dbe275d9c570d52f4",
          // idUser: req.idUser,
          // authCode: user.authCode,
        })
      } catch (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      return res.status(200).send({ data: resStats.data });
    })
}

exports.dashboard = (req, res) => {

  User.findOne({ _id: req.idUser })
    .populate('roles')
    .populate('transactions')
    .exec(async (err, user) => {

      if (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      if (!user) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      try {

        const resStats = await requestBotAPI("get", "stats?idUser=2250&authCode=1ee9394573062b6dbe275d9c570d52f4")
        const resCsv = await requestBotAPI("get", "csv?idUser=1&authCode=ea66c06c1e1c05fa9f1aa39d98dc5bc1 ")
        const daily_profit = resCsv.data.map(r => ({ date: r.period, profit: r.total_profit }))
        const result = {
          my_balance: resStats.data["current_balance"],
          total_profit: resStats.data["current_balance"],
          last_24h_profit: resStats.data["current_balance"],
          total_currencies: resStats.data["total_currencies"],
          daily_profit,
          enabled: user.enabled,
          deposit_history: user.transactions.filter(t => t.type === "Deposit"),
          withdraw_history: user.transactions.filter(t => t.type === "Withdraw"),
          profile: {
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            phoneVerified: user.phoneVerified,
            address: user.address,
            avatar: user.avatar,
            city: user.city,
            country: user.country,
            zipCode: user.zipCode,
            withdrawAddress: user.withdrawAddress,
            evmAddress: user.evmAddress,
            btcAddress: user.btcAddress,
            apiKey: user.apiKey,
            apiSecret: user.apiSecret,
            enabled: user.enabled,
            referralCode: user.referralCode,
            leaderCode: user.leaderCode,
            roles: user.roles.map(r => r.name)
          }
        }
        return res.status(200).send({ data: result, status: "success" });
      } catch (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

    })
}

exports.checkVerification = (req, res) => {

  User.findOne({ _id: req.idUser })
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

exports.getpaymentinfo = (req, res) => {

  User.findOne({ _id: req.idUser })
    .exec(async (err, user) => {

      if (err) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      if (!user) {
        return res.status(200).send({ message: err, status: "errors" });
      }

      const result = {
        evmAddress: user.evmAddress,
        btcAddress: user.btcAddress,
        paypalClientID: process.env.ADMIN_PAYPAL_CLIENT_ID,
        stripePublicKey: process.env.ADMIN_STRIPE_PUBLIC_KEY
      }
      return res.status(200).send({ data: result });

    })
}

exports.withdraw = (req, res) => {
  User.findOne({
    _id: req.idUser
  })
    .exec(async (err, user) => {
      if (err) {
        res.status(200).send({ message: "Incorrect id or password", status: "errors" });
        return;
      }

      if (!user) {
        return res.status(200).send({ message: "User doesn't exist", status: "errors" });
      }

      if (!user.withdrawAddress) {
        return res.status(200).send({ message: "Please put withdraw address", status: "errors" });
      }

      try {
            
        var data = JSON.stringify({
          idUser: 2250,
          authCode: "1ee9394573062b6dbe275d9c570d52f4",
          amount: req.body.amount
        });

        await requestBotAPI("post", "withdrawal", data)

        
      } catch (error) {
        return res.status(200).send({ message: "The amount exceeds the total funds", status: "errors" });
      }

      try {

        new Transaction({
          user: user._id,
          type: "Withdraw",
          amount: req.body.amount,
          status: "Success",
          paymentMethod: "Crypto"
      }).save(async (err, transaction) => {

        if (err) {
          console.log("error", err);
          return res.status(200).send({ message: err, status: "errors" });
        }

        user.transactions.push(transaction);
        await user.save();
        return res.status(200).send({ message: `${req.body.amount} USDC is withdrawn to ${user.withdrawAddress}`, status: "success" });

      });

      } catch (error) {
        return res.status(200).send({ message: error, status: "errors" });
      }
    })

}
