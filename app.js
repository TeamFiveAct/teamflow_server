const express = require('express');
const db = require('./models'); // index.js에서 export 한 모든 모델

const app = express();
const PORT = 8000;

// JSON 요청을 처리할 수 있도록 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.get('/', (req, res) => {
  res.json({ msg: 'Index' });
});

// 404 처리 미들웨어
app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT} 포트에서 실행 중...`);
});
