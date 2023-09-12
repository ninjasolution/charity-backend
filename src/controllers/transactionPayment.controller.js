const db = require("../models");
const Transaction = db.transaction;

exports.index = (req, res, next) => {

    const options = {}
    options._id = req.userId;
    if(req.body.paymentMethod){
        options.paymentMethod = req.body.paymentMethod;
    }

    Transaction.find(options, {}, { sort: { 'createdAt' : -1 } }, function(err, transactions) {
        if(err) {
          return res.status(200).send({message: err, status: "errors"});
        }
        return res.status(200).json(transactions);
    });
}

