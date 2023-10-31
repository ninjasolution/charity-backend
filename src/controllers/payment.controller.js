const paypal = require('paypal-rest-sdk');
const db = require("../models");
const Payment = db.payment;
const config = require('../config/stripe');
const stripe = require('stripe')(config.secretKey);
const ethers = require('ethers');
const erc20Abi = require("../abis/ERC20.json")
const chains = require("../config/chains")

// Initialize a provider (e.g., Infura)
const provider = new ethers.providers.JsonRpcProvider("YOUR_INFURA_URL");

// ERC-20 token contract address
const tokenContractAddress = "YOUR_ERC20_TOKEN_ADDRESS";

// Transaction hash to analyze
const transactionHash = "YOUR_TRANSACTION_HASH";


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.ADMIN_PAYPAL_CLIENT_ID,
  'client_secret': process.env.ADMIN_PAYPAL_CLIENT_SECRET
});

exports.payWithStripe = async (req, res) => {
  try {
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
      if (err) res.status(400).send({ status: 400, message: "fail" })
      else res.send({ status: 200, message: "success" })
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
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
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
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

exports.getCryptoInfo = (req, res) => {
  return res.send({chains: chains})
}

exports.payWithCrypto = async (req, res) => {
  try {

    const { chain } = req.body

    switch (chain) {
      case "Ethereum":
        try {
          // Get the transaction receipt
          const txReceipt = await provider.getTransactionReceipt(transactionHash);

          // Check if the transaction was successful
          if (txReceipt.status === 1) {
            const contract = new ethers.Contract(tokenContractAddress, erc20Abi, provider);

            // Get the transaction details
            const tx = await provider.getTransaction(transactionHash);

            // Get the "from" address
            const fromAddress = tx.from;

            // Parse the input data to get the "to" address and amount
            const data = ethers.utils.defaultAbiCoder.decode(["address", "uint256"], tx.data);
            const toAddress = data[0];
            const amount = data[1];

            // Check the "to" address to verify it's the ERC-20 contract
            if (toAddress === tokenContractAddress) {
              // Check if the transaction is a token transfer
              if (tx.to === tokenContractAddress) {
                const sender = fromAddress;
                const recipient = toAddress;
                console.log(`Token transfer from ${sender} to ${recipient}: ${amount} tokens`);
              } else {
                console.log("This transaction is not a token transfer.");
              }
            } else {
              console.log("The transaction is not related to the ERC-20 contract.");
            }
          } else {
            console.log("The transaction failed.");
          }
        } catch (error) {
          console.error("Error analyzing transaction:", error);
        }
        break;

      default:
        break;
    }

    return res.send({ status: 200, message: "success" })


  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};