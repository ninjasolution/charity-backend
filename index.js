const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require("bcryptjs");
const service = require("./src/service")
const cors = require("cors");
const bodyParser = require("body-parser");
const settings = require("./src/config/settings")

require('dotenv').config();

const indexRouter = require('./src/routes');
const app = express();

app.use(express.static(__dirname + 'public')); //Serves resources from public folder
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: settings.secret,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
  origin: "https://fintecapital.io"
};

app.use(cors(corsOptions));


app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
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
app.set("view engine", "ejs")

app.get("/", (req, res) => {
  return res.send("Welcome to Mr-Tradly API");
});
app.use('/api', indexRouter);




const db = require("./src/models");
const Role = db.role;
const User = db.user;
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
            password: bcrypt.hashSync("admin", 8),
            firstName: "Mykhailo",
            lastName: "Savchuk",
            emailVerified: true,
          })
          await user.save();
        })
    }
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
