const mongoose = require("mongoose");
const { DONATION_STATUS_PENDING } = require("../config");

module.exports = (connection, autoIncrement) => {

  const DonationSchema = new mongoose.Schema({
    title: String,
    description: {
      type: String,
    },
    totalAmount: Number,
    paymentMethod: {
      type: String,
      enum: ["Stripe", "Paypal", "Crypto"]
    },
    status: {
      type: Number,
      default: DONATION_STATUS_PENDING
    },
    createdBy: {
      type: Number,
      ref: "User"
    }
  });

  DonationSchema.plugin(autoIncrement.plugin, "Donation")
  const Donation = connection.model(
    "Donation",
    DonationSchema
  );

  return Donation;
}
