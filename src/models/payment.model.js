const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const PaymentSchema = new mongoose.Schema({
    address: String,
    user: {
      type: Number,
      ref: "UserRole"
    },
    donation: {
      type: Number,
      ref: "Donation"
    },
    organization: {
      type: Number,
      ref: "Organization"
    },
    totalAmount: Number,
    paymentMethod: String,
    authorizationID: String,

  });

  PaymentSchema.plugin(autoIncrement.plugin, "Payment")
  const Payment = connection.model(
    "Payment",
    PaymentSchema
  );

  return Payment;
}
