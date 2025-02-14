const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password_hash',
    },
    async (email, password_hash, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user)
          return done(null, false, {
            statue: 'ERROR',
            message: '가입된 사용자가 아닙니다.',
            data: null,
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
    id: user.user_id,
    auth_provider: user.auth_provider,
    kakao_id: user.kakao_id || null,
  });
});

passport.deserializeUser(async (data, done) => {
  try {
    const user = await User.findByPk(data.user_id);
    if (!user) return done(null, false);

    user.auth_provider = data.auth_provider;
    user.kakao_id = data.kakao_id;
    done(null, user);
  } catch (err) {
    done(err);
  }
});
