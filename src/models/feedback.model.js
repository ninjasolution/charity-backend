const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const FeedbackSchema = new mongoose.Schema({
    name: String,
    donation: {
      type: Number,
      ref: "Donation"
    },
    individual: {
      type: Number,
      ref: "Individual"
    },
    organization: {
      type: Number,
      ref: "Organization"
    },
    user: {
      type: Number,
      ref: "User"
    },
    content: {
      type: String
    }
  });

  FeedbackSchema.plugin(autoIncrement.plugin, "Feedback")
  const Feedback = connection.model(
    "Feedback",
    FeedbackSchema
  );

  return Feedback;
}
