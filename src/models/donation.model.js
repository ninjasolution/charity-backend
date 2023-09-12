const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const DonationSchema = new mongoose.Schema({
    name: String,
    individual: {
      type: Number,
      ref: "Individual"
    },
    organization: {
      type: Number,
      ref: "Organization"
    }
  });

  DonationSchema.plugin(autoIncrement.plugin, "Donation")
  const Donation = connection.model(
    "Donation",
    DonationSchema
  );

  return Donation;
}
