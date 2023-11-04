const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const autoIncrement = require('mongoose-auto-increment');

const db = {};

const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

db.mongoose = mongoose;
db.connection = db.mongoose.createConnection(`mongodb://uulpk7vgiqhefv2ohoy6:uAiaLCRqBZTBNduV361@bmy66jo2p9ta3dzydadq-mongodb.services.clever-cloud.com:2054/bmy66jo2p9ta3dzydadq`)
// db.connection = db.mongoose.createConnection(`mongodb://127.0.0.1:27017/charity`, { useNewUrlParser: true, useUnifiedTopology: true })
autoIncrement.initialize(db.connection);

db.user = require("./user.model")(db.connection, autoIncrement);
db.role = require("./role.model")(db.connection, autoIncrement);
db.token = require("./token.model")(db.connection, autoIncrement);
db.donation = require("./donation.model")(db.connection, autoIncrement);
db.feedback = require("./feedback.model")(db.connection, autoIncrement);
db.payment = require("./payment.model")(db.connection, autoIncrement);

db.ROLES = ["user", "admin", "individual", "organization"]

module.exports = db;

