// src/services/baseballCrawler.service.js
const { exec } = require("child_process");
const pythonExecPath = "/usr/bin/python3";

const fetchBaseballDataFromPython = async () => {
  return new Promise((resolve, reject) => {
    const maxBufferSize = 1024 * 1024 * 5; // Increased maxBuffer to 5MB
    exec(
      pythonExecPath + " crawl.py",
      { maxBuffer: maxBufferSize },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(
            new Error(`Python 스크립트 실행 오류: ${error.message}`)
          );
        }
        if (stderr && !stderr.includes("NotOpenSSLWarning")) {
          console.error(`stderr: ${stderr}`);
          return reject(new Error(`Python 스크립트 에러: ${stderr}`));
        }

        console.log("Raw Python Output:", stdout); // Log the raw output for debugging

        try {
          const startIndex = stdout.indexOf("---PYTHON SCRIPT OUTPUT START---");
          const endIndex = stdout.indexOf("---PYTHON SCRIPT OUTPUT END---");

          if (startIndex !== -1 && endIndex !== -1) {
            const jsonString = stdout
              .substring(startIndex + 30, endIndex)
              .trim();
            const result = JSON.parse(jsonString);
            resolve(result);
          } else {
            console.error(
              "Error: Could not find JSON delimiters in Python output."
            );
            reject(new Error("Python 스크립트 결과 형식 오류"));
          }
        } catch (parseError) {
          console.error("JSON 파싱 오류:", parseError);
          reject(new Error("Python 스크립트 결과 파싱 오류"));
        }
      }
    );
  });
};
module.exports = {
  fetchBaseballData: fetchBaseballDataFromPython,
};
