const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require("bcryptjs");
const cors = require("cors");
var path = require('path');
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname, 'public'))); //Serves resources from public folder
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs")

var corsOptions = {
  origin: process.env.CORS_ORIGIN || "https://fintecapital.io"
};

app.use(cors());

const indexRouter = require('./src/routes');
app.use('/api', indexRouter);
app.get("/check", (req, res) => {
  return res.send("Welcome to Charity API");
});


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return;
  }
  // Pass to next layer of middleware
  next();
});

const source = require("./src/config/static.source")

const db = require("./src/models");
const Role = db.role;
const User = db.user;
const Donation = db.donation;
db.connection.on("open", () => {
  console.log("Successfully connect to MongoDB.");
  initial();
})
db.connection.on("error", (err) => {
  console.error("Connection error", err);
  process.exit();
})


function initial() {
  Role.estimatedDocumentCount(async (err, count) => {
    if (!err && count === 0) {

      for (let i = 0; i < db.ROLES.length; i++) {
        try {
          let role = new Role({
            name: db.ROLES[i]
          })
          await role.save();
        } catch (err) {
          console.log(err)
        }
      }

      Role.findOne({ name: "admin" })
        .exec(async (err, role) => {
          if (err) return;
          if (!role) return;

          let user = new User({
            username: "adminuser",
            email: "admin@gmail.com",
            password: bcrypt.hash("admin", 8),
            firstName: "Mykhailo",
            lastName: "Savchuk",
            emailVerified: true,
          })
          await user.save();
        })
    }
  });

  Donation.estimatedDocumentCount(async (err, count) => {
    if (!err && count === 0) {

      for (let i = 0; i < source.donations.length; i++) {
        try {
          let donation = new Donation({
            title: source.donations[i].name
          })
          await donation.save();
        } catch (err) {
          console.log(err)
        }
      }
    }
  })
}

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
// This is a comment added as per the instructions
