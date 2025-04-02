// src/controllers/baseball.controller.js
const baseballModel = require("../models/baseball.model");

const getBaseballRecord = async (req, res) => {
  try {
    const record = await baseballModel.getBaseballRecord();
    res.status(200).json(record); // 성공 시 200 상태 코드와 함께 JSON 응답
  } catch (error) {
    console.error("야구 기록 조회 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." }); // 오류 발생 시 500 상태 코드와 함께 오류 메시지 응답
  }
};

module.exports = {
  getBaseballRecord,
};
