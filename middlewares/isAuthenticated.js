const isAuthenticated = (req, res, next) => {
  console.log('🔍 [미들웨어 실행] isAuthenticated 호출됨');
  console.log('✅ 세션 정보:', req.session);
  console.log('✅ Passport 정보:', req.session.passport);
  console.log('✅ isAuthenticated 결과:', req.isAuthenticated());

  if (!req.isAuthenticated()) {
      console.log('로그인 필요!');
      return res.status(401).json({
          status: 'ERROR',
          message: '로그인이 필요합니다.',
          data: null,
      });
  }
  console.log('로그인 확인됨');
  next();
};

module.exports = isAuthenticated;
