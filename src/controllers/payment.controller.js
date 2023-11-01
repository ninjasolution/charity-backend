const paypal = require('paypal-rest-sdk');
const db = require("../models");
const Payment = db.payment;
const config = require('../config/stripe');
const stripe = require('stripe')(config.secretKey);
const ethers = require('ethers');
const erc20Abi = require("../abis/ERC20.json")
const chains = require("../config/chains")

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.ADMIN_PAYPAL_CLIENT_ID,
  'client_secret': process.env.ADMIN_PAYPAL_CLIENT_SECRET
});

exports.payWithStripe = async (req, res) => {
  const { token, amount, description, currency, user, address } = req.body;
  console.log(req.body)
  try {
    stripe.charges.create({
      amount,
      currency,
      source: token.id,
      description,
      metadata: {
        productId: 1
      }
    }, async (err, charge) => {
      console.log(err)
      if (err) return res.status(400).send({ status: 400, message: "fail" })
      else {

        const payment = new Payment({
          address,
          user,
          amount,
          currency,
          description,
          method: "Stripe" 
        })
        try {
          await payment.save();
          return res.send({ status: 200, message: "success" })
        }catch (err) {
          return res.status(500).send({ status: 200, message: err })
        }
      }
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

exports.getChains = (req, res) => {
  return res.send({ chains: chains })
}

exports.payWithCrypto = async (req, res) => {
  try {

    const { chain, coin, hash, user, address } = req.body;
    console.log(req.body)

    const chainDetails = chains.find(item => item.id == chain);
    if (!chainDetails?.coins) {
      return res.status(400).send({ message: "Invalid request" })
    }
    const coinDetails = chainDetails.coins.find(item => item.symbol == "USDT")
    if (!coinDetails?.symbol) {
      return res.status(400).send({ message: "Invalid request" })
    }
    // Initialize a provider (e.g., Infura)
    const provider = new ethers.JsonRpcProvider(chainDetails.rpc);

    // ERC-20 token contract address
    const tokenContractAddress = coinDetails.address;

    switch (chain) {
      case "0":
      case "1":
        try {
          // Get the transaction receipt
          const txReceipt = await provider.getTransactionReceipt(hash);

          // Check if the transaction was successful
          if (txReceipt.status === 1) {

            // Get the transaction details
            const tx = await provider.getTransaction(hash);
            if (tokenContractAddress == "") {
              // Check if the transaction is for Ether transfer
              if (tx.value) {
                const amountInWei = tx.value;
                const amountInEther = ethers.formatEther(amountInWei);
                const fromAddress = tx.from;
                const toAddress = tx.to;

                console.log(`ETH transfer from ${fromAddress} to ${toAddress}: ${amountInEther} ETH`);
              } else {
                console.log("This transaction does not involve an Ether transfer.");
              }
            } else if (tx.to === tokenContractAddress) {
              // Get the "from" and "to" addresses and the amount from the logs
              const contract = new ethers.Contract(tokenContractAddress, erc20Abi.abi, provider);
              const filter = contract.filters.Transfer(null, null, null);
              const logs = await provider.getLogs({
                fromBlock: tx.blockNumber,
                toBlock: tx.blockNumber,
                address: tokenContractAddress,
                topics: filter.topics,
              });

              if (logs.length > 0) {
                const parsedLog = contract.interface.parseLog(logs[0]);
                const fromAddress = parsedLog.args[0];
                const toAddress = parsedLog.args[1];
                const amount = parsedLog.args[2];

                console.log(`Token transfer from ${fromAddress} to ${toAddress}: ${amount.toString()} tokens`);
              } else {
                console.log("No Transfer event logs found for this transaction.");
              }
            } else {
              console.log("This transaction is not related to the ERC-20 contract.");
            }
          } else {
            console.log("The transaction failed.");
          }
        } catch (error) {
          console.error("Error analyzing transaction:", error);
        }
        break;
      case "2":
        const transactionHash = 'YOUR_BITCOIN_TRANSACTION_HASH';

        // Define the Blockstream API endpoint
        const blockstreamApiUrl = `https://blockstream.info/api/tx/${transactionHash}`;
        try {
          const response = await fetch(blockstreamApiUrl);
          if (response.ok) {
            const data = await response.json();
            const vin = data.vin[0]; // Assuming a single input for simplicity
            const vout = data.vout[0]; // Assuming a single output for simplicity

            const from = vin.prevout.scriptpubkey_address;
            const to = vout.scriptpubkey_address;
            const amount = vout.value;

            console.log(`Sender (from): ${from}`);
            console.log(`Recipient (to): ${to}`);
            console.log(`Amount (BTC): ${amount / 100000000}`); // Convert from satoshis to BTC
          } else {
            console.error('Failed to fetch transaction details:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching transaction details:', error);
        }
        break;
      default:
        break;
    }

    return res.send({ status: 200, message: "success" })
  } catch (err) {
    console.log(err)
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
};