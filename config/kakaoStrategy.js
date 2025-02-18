/*
- 카카오 로그인하는 passport 미들웨어
*/
const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/User');
const env = 'development';
//const env = 'production';
const config = require(__dirname + '/../config/config.json')[env];
const kakaoConfig = config.kakao;

passport.use(
  new kakaoStrategy(
    {
      clientID: kakaoConfig.clientID,
      clientSecret: kakaoConfig.clientSecret,
      callbackURL: kakaoConfig.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { kakao_id: profile.id } });
        if (!user) {
          user = await User.create({
            auth_provider: 'kakao',
            kakao_id: profile.id,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
