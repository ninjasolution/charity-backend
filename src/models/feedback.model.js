const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const FeedbackSchema = new mongoose.Schema({
    topic: String,
    donation: {
      type: Number,
      ref: "Donation"
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
