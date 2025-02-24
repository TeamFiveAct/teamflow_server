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
 *     summary: 사용자 회원가입
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
 *                 description: 사용자 이메일
 *                 example: "test@test.com"
 *               password_hash:
 *                 type: string
 *                 description: 사용자 비밀번호
 *                 example: "qwer1234"
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *                 example: "철수"
 *               profile_image:
 *                 type: string
 *                 description: 사용자 프로필 사진 (선택 지정)
 *                 example: "사진1.jpg"
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "회원가입이 완료되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       example: "철수"
 *       409:
 *         description: 중복된 이메일
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "이미 가입된 사용자입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       410:
 *         description: 탈퇴한 계정
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "탈퇴한 계정입니다. 복구를 원하시면 관리자에게 문의하세요."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
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
 *       - in: query
 *         name: nickname
 *         required: true
 *         description: 중복 확인할 닉네임
 *         schema:
 *           type: string
 *           example: "철수"
 *     responses:
 *       200:
 *         description: 사용 가능한 닉네임
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "사용 가능한 닉네임입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       409:
 *         description: 중복된 닉네임 존재
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "중복된 닉네임이 존재합니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 */

// 닉네임 중복 확인
router.get('/check-name', controller.getCheckName);

/**
 * @swagger
 * /v1/user/check-email:
 *   get:
 *     summary: 이메일 중복 확인
 *     description: 사용자가 입력한 이메일이 중복되었는지 확인합니다.
 *     tags: [User]
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         description: 확인할 이메일
 *         schema:
 *           type: string
 *           example: "test@test.com"
 *     responses:
 *       200:
 *         description: 사용 가능한 이메일
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "사용가능한 이메일입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       409:
 *         description: 중복된 이메일
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "중복된 이메일이 존재합니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류가 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 */
// 이메일 중복 확인
router.get('/check-email', controller.getCheckEmail);

/**
 * @swagger
 * /v1/user/login:
 *   post:
 *     summary: 사용자 로그인 (이메일 기반)
 *     description: 이메일 기반으로 사용자 로그인을 합니다. 로그인 성공 시 세션이 생성됩니다.
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
 *                 example: "test@test.com"
 *               password:
 *                 type: string
 *                 example: "qwer1234"
 *     responses:
 *       200:
 *         description: 로그인 성공 (세션 생성됨)
 *         headers:
 *           Set-Cookie:
 *             description: 세션 쿠키 (세션 유지에 사용)
 *             schema:
 *               type: string
 *               example: "connect.sid=s%3Aabc1234; Path=/; HttpOnly; Secure"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "로그인이 성공되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       example: "nickname123"
 *       404:
 *         description: 가입된 사용자가 아닐 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "가입된 사용자가 아닙니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       403:
 *         description: 비밀번호가 틀릴 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "비밀번호를 확인하세요."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 */

// 이메일 기반 로그인
router.post('/login', controller.postLogin);

/**
 * @swagger
 * /v1/user/kakao-login:
 *   get:
 *     summary: 카카오 로그인
 *     description: 카카오 OAuth 로그인 페이지로 이동합니다. 로그인 후 자동으로 카카오 콜백이 호출되어 세션이 생성됩니다.
 *     tags: [User]
 *     responses:
 *       302:
 *         description: 카카오 로그인 페이지로 리다이렉트됨
 *         headers:
 *           Location:
 *             description: 카카오 로그인 페이지 URL
 *             schema:
 *               type: string
 *               example: "https://kauth.kakao.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code"
 *       200:
 *         description: 로그인 성공 (세션 생성됨)
 *         headers:
 *           Set-Cookie:
 *             description: 세션 쿠키 (세션 유지에 사용)
 *             schema:
 *               type: string
 *               example: "connect.sid=s%3Aabc1234; Path=/; HttpOnly; Secure"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "로그인이 성공되었습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 */

// 카카오 기반 로그인
router.get('/kakao-login', controller.getKakaoLogin);

/**
 * @swagger
 * /v1/user/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백 (자동 호출)
 *     description: 카카오 로그인 성공 후 자동으로 호출되는 콜백 엔드포인트입니다. 클라이언트가 직접 호출할 필요 없습니다.
 *     tags: [User]
 *     responses:
 *       302:
 *         description: 로그인 성공 후 메세지 전달
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
// 카카오 로그인 콜백 함수 (카카오 로그인 성공/실패시) - 클라이언트에서 호출해줄필요없이 리다이렉트 됨
router.get('/kakao/callback', controller.getKakaoCallback);

/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     summary: 사용자 로그아웃 (이메일 기반)
 *     description: 현재 로그인된 사용자의 세션을 삭제하고 로그아웃합니다.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 로그아웃 성공 (세션 삭제됨)
 *         headers:
 *           Set-Cookie:
 *             description: 세션 쿠키 삭제 (만료 처리됨)
 *             schema:
 *               type: string
 *               example: "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "로그아웃이 처리되었습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: 로그인되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "로그인된 사용자가 없습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 서버 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 */

// 이메일 기반 로그아웃
router.post('/logout', controller.postLogout);

// 카카오 로그아웃
router.post('/kakao-logout', controller.postKakaoLogout);

// 세션 여부 확인
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
