const db = require("../models");
const Donation = db.donation;
const User = db.user;

// Create a new Donation
exports.create = (req, res) => {
    // Validate request
    if (!req.body.amount) {
        res.status(400).send({ message: "Amount can not be empty!" });
        return;
    }

    // Create a Donation
    const donation = new Donation({
        amount: req.body.amount,
        createdBy: req.userId,
        status: "Pending"
    });

    // Save Donation in the database
    donation
        .save(donation)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Donation."
            });
        });
};

// Retrieve all Donations from the database.
exports.findAll = (req, res) => {
    const createdBy = req.query.createdBy;
    const status = req.query.status;
    let condition = createdBy ? { createdBy: createdBy } : {};
    condition = status ? { ...condition, status: status } : condition;

    Donation.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving donations."
            });
        });
};

// Find a single Donation with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Donation.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Donation with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving Donation with id=" + id });
        });
};

// Update a Donation by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Donation.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Donation with id=${id}. Maybe Donation was not found!`
                });
            } else res.send({ message: "Donation was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Donation with id=" + id
            });
        });
};

// Delete a Donation with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Donation.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Donation with id=${id}. Maybe Donation was not found!`
                });
            } else {
                res.send({
                    message: "Donation was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Donation with id=" + id
            });
        });
};

// Approve a Donation with the specified id in the request
exports.approve = (req, res) => {
    const id = req.params.id;


    Donation.findByIdAndUpdate(id, { status: "Approved" }, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot approve Donation with id=${id}. Maybe Donation was not found!`
                });
            } else res.send({ message: "Donation was approved successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error approving Donation with id=" + id
            });
        });
}
