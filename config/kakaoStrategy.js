const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/User');
const env = 'development';
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
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          user.access_token = accessToken;
          user.refresh_token = refreshToken;
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
