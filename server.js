const app = require("./src/app");
const port = 8085; // 변경된 포트 번호

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
