const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const DonationSchema = new mongoose.Schema({
    amount: Number,
    paymentMethod: {
      type: String,
      enum: ["Stripe", "Paypal", "Crypto"]
    },
    donation: {
      type: Number,
      ref: "Donation"
    },
    user: {
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
