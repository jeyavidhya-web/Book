const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Show secret word form
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('secretword', { secretWord: user.secretWord, errors: req.flash('error'), info: req.flash('info') });
});

// Update secret word
router.post('/', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.userId, { secretWord: req.body.secretWord });
    req.flash('info', 'Secret word updated');
    res.redirect('/secretword');
  } catch {
    req.flash('error', 'Error updating secret word');
    res.redirect('/secretword');
  }
});

module.exports = router;
