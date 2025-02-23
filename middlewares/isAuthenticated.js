const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({
          status: 'ERROR',
          message: '로그인이 필요합니다.',
          data: null,
      });
  }
  next();
};

module.exports = isAuthenticated;
