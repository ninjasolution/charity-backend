const db = require("../models");
const Feedback = db.feedback;

exports.create = (req, res) => {
    // Validate request
    if (!req.body.donation) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    // Create a Feedback
    const feedback = new Feedback({
        topic: req.body.topic,
        donation: req.body.donation,
        user: req.userId
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
    let condition = userId ? { user: userId } : {};
    condition = donationId ? { ...condition, donation: donationId } : condition;

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

