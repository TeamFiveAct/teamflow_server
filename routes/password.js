// routes/password.js

const express = require('express');
const router = express.Router();
const PasswordController = require('../controllers/Cpassword');
const sendEmailMiddleware = require('../middlewares/emailMiddleware');

/**
 * @swagger
 * /v1/user/request-reset:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     description: 사용자가 비밀번호 재설정을 요청하면, 이메일로 재설정 링크를 발송합니다.
 *     tags:
 *       - Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: kyj002002@naver.com
 *     responses:
 *       200:
 *         description: 재설정 이메일 발송 성공 또는 요청 접수됨.
 */
router.post(
  '/request-reset',
  sendEmailMiddleware, // This will handle sending the email
  PasswordController.requestReset
);

/**
 * @swagger
 * /v1/user/reset-password:
 *   get:
 *     summary: 비밀번호 재설정 페이지 표시
 *     description: 사용자가 비밀번호 재설정 폼을 볼 수 있도록 페이지를 렌더링합니다.
 *     tags:
 *       - Password
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 페이지가 정상적으로 렌더링됨.
 */
router.get('/reset-password', PasswordController.renderResetPage);

/**
 * @swagger
 * /v1/user/reset-password:
 *   post:
 *     summary: 비밀번호 재설정 처리
 *     description: 사용자가 입력한 새 비밀번호로 비밀번호를 업데이트합니다.
 *     tags:
 *       - Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset-token-example"
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: 비밀번호가 성공적으로 변경됨.
 */
router.post('/reset-password', PasswordController.resetPassword);

module.exports = router;
