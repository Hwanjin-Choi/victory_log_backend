// src/services/baseballCrawler.service.js
const { exec } = require("child_process");
const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const pythonExecPath = "/usr/bin/python3";
const csvFilePath = path.join(__dirname, "../../baseball_data.csv");

const fetchBaseballDataFromPython = async () => {
  return new Promise((resolve, reject) => {
    const maxBufferSize = 1024 * 1024 * 5; // Increased maxBuffer to 5MB
    const crawlUrl =
      "https://m.sports.naver.com/kbaseball/schedule/index?category=kbo&date=2025-04-01&teamCode=SK";
    exec(
      `${pythonExecPath} crawl.py "${crawlUrl}"`,
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
            // 시작 구분자 이후부터 끝 구분자 이전까지 추출
            const jsonStringWithWrapper = stdout.substring(
              startIndex,
              endIndex + "---PYTHON SCRIPT OUTPUT END---".length
            );
            const jsonString = jsonStringWithWrapper
              .replace("---PYTHON SCRIPT OUTPUT START---", "")
              .replace("---PYTHON SCRIPT OUTPUT END---", "")
              .trim();
            try {
              const result = JSON.parse(jsonString);
              resolve(result);
            } catch (parseError) {
              console.error("JSON 파싱 오류 (수정):", parseError);
              console.error("Failed JSON String:", jsonString); // 파싱에 실패한 문자열을 로그로 출력
              reject(new Error("Python 스크립트 결과 파싱 오류 (수정)"));
            }
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

const fetchBaseballDataFromCSV = async () => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        console.error("CSV 파일 읽기 오류:", error);
        reject(new Error("CSV 파일 읽기 오류"));
      });
  });
};

module.exports = {
  fetchBaseballDataPython: fetchBaseballDataFromPython,
  fetchBaseballDataCSV: fetchBaseballDataFromCSV,
};
