const db = require("../models");
const Feedback = db.feedback;
const User = db.user;

exports.createFeedback = (req, res) => {
    // Validate request
    if (!req.body.topic) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }
  
    // Create a Feedback
    const feedback = new Feedback({
      topic: req.body.topic,
      donation: req.body.donation,
      userId: req.body.userId
    });
  
    // Save Feedback in the database
    feedback
      .save(feedback)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Feedback."
        });
      });
  };
  // Retrieve all Feedbacks from the database.
  exports.findAll = (req, res) => {
    const userId = req.query.userId;
    const donationId = req.query.donationId;
    let condition = userId ? { userId: userId } : {};
    condition = donationId ? { ...condition, donationId: donationId } : condition;
  
    Feedback.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving feedbacks."
        });
      });
  };
  
  // Find a single Feedback with an id
  exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Feedback.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Feedback with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Feedback with id=" + id });
      });
  };
  
  // Update a Feedback by the id in the request
  exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.params.id;
  
    Feedback.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Feedback with id=${id}. Maybe Feedback was not found!`
          });
        } else res.send({ message: "Feedback was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Feedback with id=" + id
        });
      });
  };
  
  // Delete a Feedback with the specified id in the request
  exports.delete = (req, res) => {
    const id = req.params.id;
  
    Feedback.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Feedback with id=${id}. Maybe Feedback was not found!`
          });
        } else {
          res.send({
            message: "Feedback was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Feedback with id=" + id
        });
      });
  };