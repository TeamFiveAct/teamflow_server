const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password_hash',
      session: true,
    },
    async (email, password_hash, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user)
          return done(null, false, {
            message: '가입된 사용자가 아닙니다.',
          });

        const isMatch = await bcrypt.compare(password_hash, user.password_hash);
        if (!isMatch)
          return done(null, false, { message: '비밀번호를 확인하세요' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    user_id: user.user_id,
    auth_provider: user.auth_provider,
    kakao_access_token: user.kakao_access_token || null,
  });
});

passport.deserializeUser(async (data, done) => {
  try {
    const user = await User.findByPk(data.user_id);
    if (!user) return done(null, false);

    user.auth_provider = data.auth_provider;
    user.kakao_access_token = data.kakao_access_token;
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
