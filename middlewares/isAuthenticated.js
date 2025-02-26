const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({
          status: 'ERROR',
          message: '로그인되지 않은 사용자입니다.',
          data: null,
      });
  }
  next();
};

module.exports = isAuthenticated;
