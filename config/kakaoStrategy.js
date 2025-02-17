/*
- 카카오 로그인하는 passport 미들웨어
*/
const passport = require("passport");
const kakaoStrategy = require("passport-kakao").Strategy;
const User = require("../models/User");

passport.use(new kakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
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
}));

module.exports = passport;