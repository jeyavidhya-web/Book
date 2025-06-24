

const express = require("express");
require("express-async-errors");
require("dotenv").config();
const app = express();

const mongoose = require('mongoose');

require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");
const passport = require('passport');
require('./config/passport')(passport); 

const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGODB_URI;
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");


const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("connect-flash")());
const sessionRoutes = require('./routes/sessions');
app.use('/sessions', sessionRoutes);

const bookRoutes = require('./routes/books');
const auth = require("./middleware/auth");
app.use('/books', auth, bookRoutes);


// let secretWord = "syzygy"; <-- comment this out or remove this line
app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  res.render("secretWord", { secretWord: req.session.secretWord });
});
app.post("/secretWord", (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});


app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();