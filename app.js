const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('./config/passport');
//const env = 'production';
const env = 'development';
const config = require('./config/config.json')[env];

const db = require('./models'); // index.js에서 export 한 모든 모델

// 라우터 로드
const userRouter = require('./routes/user');
const workspaceRouter = require('./routes/workspace');
const todosRouter = require('./routes/todos');
const uploadRouter = require('./routes/upload'); // 파일 업로드 라우터
const chatSocket = require('./sockets/chat'); // Socket.io 이벤트 핸들러

const app = express();
require('dotenv').config();
const PORT = 8000;

// JSON 요청 및 URL 인코딩된 요청 처리
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 및 Passport 설정
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 4 * 60 * 60 * 1000, // 세션 임시 4시간으로 설정
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 업로드 폴더 생성 및 정적 파일 서빙
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ msg: 'Index' });
});

// 라우터 연결 (필요에 따라 경로 조정)
app.use('/v1/user', userRouter);
app.use('/v1/workspace', workspaceRouter);
app.use('/v1/workspace/:space_id/todos', todosRouter);
app.use('/upload', uploadRouter);

// 404 처리 미들웨어
app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

// HTTP 서버 생성 후 Express 앱과 Socket.io 연결
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발용. 배포 시 허용 도메인 지정
  },
});

// Socket.io 이벤트 핸들러 연결
chatSocket(io);

// 서버 실행
server.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT} 포트에서 실행 중...`);
});
