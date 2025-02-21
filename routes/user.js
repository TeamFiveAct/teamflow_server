const express = require('express');
const router = express.Router();
const controller = require('../controllers/Cuser');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관련 API
 */

/**
 * @swagger
 * /v1/user/join:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               nickname:
 *                 type: string
 *                 example: "nickname123"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 요청 데이터가 올바르지 않음
 */
// 회원가입
router.post('/join', controller.postJoin);

/**
 * @swagger
 * /v1/user/check-name:
 *   get:
 *     summary: 닉네임 중복 확인
 *     description: 사용자가 입력한 닉네임이 중복되었는지 확인합니다.
 *     tags: [User]
 *     parameters:
 *       - name: nickname
 *         in: query
 *         required: true
 *         description: 확인할 닉네임
 *         schema:
 *           type: string
 *           example: "nickname123"
 *     responses:
 *       200:
 *         description: 사용 가능한 닉네임
 *       409:
 *         description: 중복된 닉네임
 */
// 닉네임 중복 확인
router.get('/check-name', controller.getCheckName);

// 이메일 중복 확인
router.get('/check-email', controller.getCheckEmail);

// 이메일 기반 로그인
router.post('/login', controller.postLogin);

// 카카오 기반 로그인
router.get('/kakao-login', controller.getKakaoLogin);

// 카카오 로그인 콜백 함수 (카카오 로그인 성공/실패시) - 클라이언트에서 호출해줄필요없이 리다이렉트 됨
router.get('/kakao/callback', controller.getKakaoCallback);

// 이메일 기반 로그아웃
router.post('/logout', controller.postLogout);

// 카카오 로그아웃
router.post('/kakao-logout', controller.postKakaoLogout);

// 세션 확인
router.get('/session', controller.getSession);

// 회원탈퇴
router.delete('/', controller.deleteMyInfo);

/**
 * @swagger
 * /v1/user/info:
 *   get:
 *     summary: 로그인 쿠키로 사용자 정보 조회
 *     description: 로그인 쿠키를 통해 인증된 사용자의 정보를 조회합니다.
 *     tags:
 *       - User
 *     parameters:
 *       - in: cookie
 *         name: cookie
 *         required: true
 *         description: 사용자 인증 쿠키
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 정보가 성공적으로 조회됨.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 nickname:
 *                   type: string
 *                 profile_image:
 *                   type: string
 */
router.get('/info', controller.getUserInfo);

/**
 * @swagger
 * /v1/user/info:
 *   put:
 *     summary: 로그인 쿠키로 사용자 정보 수정
 *     description: 로그인 쿠키를 통해 인증된 사용자의 이메일, 닉네임, 프로필 이미지, 비밀번호 등 정보를 수정합니다.
 *     tags:
 *       - User
 *     parameters:
 *       - in: cookie
 *         name: cookie
 *         required: true
 *         description: 사용자 인증 쿠키
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               nickname:
 *                 type: string
 *                 example: newnickname
 *               profile_image:
 *                 type: string
 *                 example: http://example.com/new-profile.png
 *               password:
 *                 type: string
 *                 example: newpassword
 *     responses:
 *       200:
 *         description: 사용자 정보가 성공적으로 수정됨.
 */
router.put('/info', controller.updateUserInfo);

module.exports = router;
