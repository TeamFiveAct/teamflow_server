const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

// Multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, 'chat-' + uniqueSuffix);
  },
});
const upload = multer({ storage });

// 파일 업로드 엔드포인트 (POST /upload)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // 요청 프로토콜, 호스트를 사용하여 파일 URL 생성
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${
    req.file.filename
  }`;
  return res.json({ url: fileUrl });
});

module.exports = router;
