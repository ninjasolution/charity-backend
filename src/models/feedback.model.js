const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const FeedbackSchema = new mongoose.Schema({
    name: String,
    donation: {
      type: Number,
      ref: "Donation"
    },
    user: {
      type: Number,
      ref: "UserRole"
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
