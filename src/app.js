// src/app.js
const express = require("express");
const baseballRoutes = require("./routes/baseball.routes");
const loggerMiddleware = require("./middlewares/logger.middleware");

const app = express();

// 미들웨어 적용 (전역)
app.use(loggerMiddleware);
app.use(express.json()); // JSON 요청 본문 파싱을 위한 미들웨어

// 라우터 연결
app.use("/baseball", baseballRoutes); // '/baseball' 경로로 시작하는 모든 요청은 baseballRoutes로 전달

module.exports = app;
