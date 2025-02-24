//teamflow_server\app.js
const express = require('express');
const http = require('http');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const multer = require('multer');
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('./config/passport');
const env = 'localDev';
const cors = require('cors');
const config = require('./config/config.json')[env];

const db = require('./models');

const { swaggerUi, specs } = require('./swagger');

const app = express();
require('dotenv').config();
const PORT = 8000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 4 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const userRouter = require('./routes/user');
const passwordRouter = require('./routes/password');
const workspaceRouter = require('./routes/workspace');
const todosRouter = require('./routes/todos');
const uploadRouter = require('./routes/upload');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ msg: 'Index' });
});

app.use('/v1/user', userRouter);
app.use('/v1/user', passwordRouter);
app.use('/v1/workspace', workspaceRouter);
app.use('/v1/workspace/:space_id/todos', todosRouter);
app.use('/upload', uploadRouter);

// ─────────────────────────────────────────────────────────
// 채팅 기록 전체 불러오기 엔드포인트 (특정 workspace 기준)
// ─────────────────────────────────────────────────────────
app.get('/v1/workspace/:workspace_id/chathistory', async (req, res) => {
  const { workspace_id } = req.params;
  try {
    const messages = await db.Message.findAll({
      where: { workspace_id },
      order: [['created_at', 'ASC']],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const chatSocket = require('./sockets/chat');
chatSocket(io);

server.listen(PORT, () => {
  console.log(
    `🚀 서버가 ${PORT} 포트에서 실행 중...API 문서는 http://localhost:${PORT}/api-docs 에서 확인하세요.`
  );
});
