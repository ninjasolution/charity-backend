const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const PaymentSchema = new mongoose.Schema({
    address: String,
    user: {
      type: Number,
      ref: "User"
    },
    donation: {
      type: Number,
      ref: "Donation"
    },
    organization: {
      type: Number,
      ref: "Organization"
    },
    transactionId: String,
    amount: Number,
    currency: String,
    status: String,
    method: String

  });

  PaymentSchema.plugin(autoIncrement.plugin, "Payment")
  const Payment = connection.model(
    "Payment",
    PaymentSchema
  );

  return Payment;
}
