const stripe = require('stripe')(process.env.ADMIN_STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const db = require("../models");
const Payment = payment;

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.ADMIN_PAYPAL_CLIENT_ID,
  'client_secret': process.env.ADMIN_PAYPAL_CLIENT_SECRET
});

exports.payWithStripe = async (req, res) => {
  const { amount, currency, source } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
    });

    // Save transaction ID to database
    const payment = new Payment({
      transactionId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      method: 'stripe',
    });
    await payment.save();

    res.status(200).json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.payWithPaypal = async (req, res) => {
  const { total } = req.body;

  const paymentJson = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://return.url",
      "cancel_url": "http://cancel.url"
    },
    "transactions": [{
      "amount": {
        "total": total,
        "currency": "USD"
      },
      "description": "This is the payment description."
    }]
  };

  paypal.payment.create(paymentJson, function (error, payment) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      for(let i = 0; i < payment.links.length; i++){
        if(payment.links[i].rel === 'approval_url'){
          res.status(200).json({ approval_url: payment.links[i].href });
        }
      }
    }
  });
};

exports.confirmPaypalPayment = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      // Save transaction ID to database
      const paymentRecord = new Payment({
        transactionId: payment.id,
        amount: payment.transactions[0].amount.total,
        currency: payment.transactions[0].amount.currency,
        status: payment.state,
        method: 'paypal',
      });
      await paymentRecord.save();

      res.status(200).json(payment);
    }
  });
};