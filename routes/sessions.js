
const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/User');
const bcrypt = require('bcryptjs');




// 🔹 Show registration form
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

// 🔹 Handle registration
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log('Form submitted:', { email, password, confirmPassword });
  const errors = [];

  if (!email || !password || !confirmPassword) {
    errors.push('All fields are required');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    errors.push('Email already registered');
  }

  if (errors.length > 0) {
    return res.render('register', { errors });
  }

  const newUser = new User({ name, email, password: password });
  await newUser.save();

  req.flash("info", "Registration successful! Please log in.");
  res.redirect("/sessions/logon");
});
  

router.get('/logon', (req, res) => {
  const errors = req.flash('error');
  const info = req.flash('info');
  res.render('logon', { errors, info });
});


// POST /sessions/logon
router.post(
  "/logon",
  passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/sessions/logon",
    failureFlash: true,
  })
);


router.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Optional: clear session cookie
     //req.flash("info", "You have logged out.");
      res.redirect("/sessions/logon");
    });
  });
});

module.exports = router;

