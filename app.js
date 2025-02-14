const express = require("express");
const db = require("./models"); // index.js에서 export 한 모든 모델

// 라우터 로드
const userRouter = require("./routes/user");
const workspaceRouter = require("./routes/workspace");
const todosRouter = require("./routes/todos");

const app = express();
const PORT = 8080;

// DB Sync (실제 운영환경에서는 위험할 수 있으니 주의)
db.User.sequelize
  .sync({ force: false }) // force: true 시 기존 테이블 삭제 후 재생성
  .then(() => {
    console.log("✅ Sequelize 모델/테이블 동기화 완료");
  })
  .catch((err) => {
    console.error("❌ Sequelize 동기화 실패:", err);
  });

// JSON 요청을 처리할 수 있도록 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.get("/", (req, res) => {
  res.json({ msg: "Index" });
});

// 라우터 연결
app.use("/user", userRouter);
app.use("/workspace", workspaceRouter);
app.use("/todos", todosRouter);

// 404 처리 미들웨어
app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT} 포트에서 실행 중...`);
});
