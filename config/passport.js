const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
module.exports = function (passport) {

  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  console.log('Login attempt:', email);
  try {
    const user = await User.findOne({ email: email});
    if (!user) {
      console.log('No user found with email:', email);
      return done(null, false, { message: 'Incorrect email.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password match:', isMatch);
      return done(null, false, { message: 'Incorrect password.' });
    }

    console.log("done called")
    return done(null, user);

  } catch (err) {
    return done(err);
  }
  
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

}



