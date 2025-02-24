//teamflow_server\routes\upload.js
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

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: 파일 업로드
 *     tags: [fileupload]
 *     description: 클라이언트에서 업로드한 파일을 서버의 uploads 폴더에 저장하고, 접근 가능한 URL을 반환합니다.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: 업로드할 파일
 *         required: true
 *     responses:
 *       200:
 *         description: 파일 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: 업로드된 파일의 URL
 *       400:
 *         description: 파일이 업로드되지 않은 경우
 */
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
