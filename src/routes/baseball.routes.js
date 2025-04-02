// src/routes/baseball.routes.js
const express = require("express");
const baseballController = require("../controllers/baseball.controller");

const router = express.Router();

// GET /baseball/record 엔드포인트
router.get("/record", baseballController.getBaseballRecord);

module.exports = router;
