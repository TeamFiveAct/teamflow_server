const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((user, done) => {

  if (user.auth_provider === 'kakao') {
    done(null, {
      user_id: user.user_id,
      auth_provider: user.auth_provider,
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    });
  } else {
    done(null, {
      user_id: user.user_id,
      auth_provider: user.auth_provider,
    });
  }
});

passport.deserializeUser(async (data, done) => {

  try {
    const user = await User.findByPk(data.user_id);
    if (!user) return done(null, false);

    user.auth_provider = data.auth_provider;

    if (data.auth_provider === 'kakao') {
      user.access_token = data.access_token;
      user.refresh_token = data.refresh_token;
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

require('./localStrategy');
require('./kakaoStrategy');

module.exports = passport;
