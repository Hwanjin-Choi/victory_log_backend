// src/middlewares/logger.middleware.js
const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // 다음 미들웨어 또는 라우트 핸들러로 제어를 넘깁니다.
};

module.exports = loggerMiddleware;
