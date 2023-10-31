const db = require("../models");
const Donation = db.donation;
const config = require('../config/stripe');
const stripe = require('stripe')(config.secretKey);

exports.createCharge = async (req, res) => {
    try {
        console.log(req.body.amount)
        stripe.charges.create({
            amount: req.body.amount,
            currency: "USD",
            source: req.body.token.id,
            description: `Donation`,
            metadata: {
                productId: 1
            }
        }, (err, charge) => {
            console.log(err)
            if(err)  res.status(400).send({status: 400, message: "fail"})
            else res.send({status: 200, message: "success"})
          });

        
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
}


