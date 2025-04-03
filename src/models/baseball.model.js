// src/models/baseball.model.js
const baseballCrawlerService = require("../services/baseballCrawler.service");

const getBaseballRecordFromExternalSource = async () => {
  try {
    const data = await baseballCrawlerService.fetchBaseballDataPython();
    /* console.log("Python Crawl Success, CSV Reading");
    const data = await baseballCrawlerService.fetchBaseballDataCSV(); */

    return data;
  } catch (error) {
    console.error("모델에서 크롤러 서비스 호출 중 오류:", error);
    throw error;
  }
};

module.exports = {
  getBaseballRecord: getBaseballRecordFromExternalSource,
};
