const db = require("../models");
const Donation = db.donation;
const User = db.user;
const config = require('../config/stripe');
const stripe = require('stripe')(config.secretKey);




exports.createCharge = async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "USD",
            amount: req.body.amount,
            automatic_payment_methods: { enabled: true },
        });

        // Send publishable key and PaymentIntent details to client
        return res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
}


