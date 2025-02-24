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
 *                   example: "회원가입이 성공되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       example: "nickname123"
 *       401:
 *         description: 이미 가입된 사용자
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
 *         description: 탈퇴한 계정일 경우
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
 *                   example: "사용가능한 닉네임입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       409:
 *         description: 중복된 닉네임
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
 *           example: "test@example.com"
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
 *     description: 이메일 기반으로 사용자 로그인을 합니다.
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
 *     responses:
 *       200:
 *         description: 로그인 성공
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
// 이메일 기반 로그인
router.post('/login', controller.postLogin);

/**
 * @swagger
 * /v1/user/kakao-login:
 *   post:
 *     summary: 사용자 로그인 (카카오 기반)
 *     description: 카카오 기반으로 사용자 로그인을 합니다.
 *     tags: [User]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: 로그인 성공
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
// 카카오 기반 로그인
router.get('/kakao-login', controller.getKakaoLogin);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관련 API
 */

/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     summary: 이메일 기반 로그아웃
 *     description: 로그인한 사용자의 세션을 종료하고 쿠키를 제거하여 로그아웃 처리합니다.
 *     tags: [User]
 *     parameters:
 *       - in: cookie
 *         name: connect.sid
 *         required: true
 *         description: 사용자 세션 쿠키
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 로그아웃 성공
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
 *                   example: "로그아웃 성공했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 로그아웃 처리 중 서버 오류 발생
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
router.post('/logout', controller.postLogout);

/**
 * @swagger
 * /v1/user/kakao-logout:
 *   post:
 *     summary: 카카오 로그아웃
 *     description: 카카오 액세스 토큰을 사용하여 카카오 로그아웃 API를 호출한 후, 세션과 쿠키를 제거합니다.
 *     tags: [User]
 *     parameters:
 *       - in: cookie
 *         name: connect.sid
 *         required: true
 *         description: 사용자 세션 쿠키
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 카카오 로그아웃 성공
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
 *                   example: "카카오 로그아웃 성공했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 로그아웃 처리 중 서버 오류 발생 또는 카카오 로그아웃 실패
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
router.post('/kakao-logout', controller.postKakaoLogout);

/**
 * @swagger
 * /v1/user/session:
 *   get:
 *     summary: 세션 여부 확인
 *     description: 현재 로그인한 사용자의 세션 존재 여부를 확인합니다. 세션이 존재하면 인증 제공자(auth_provider) 정보를 반환합니다.
 *     tags: [User]
 *     parameters:
 *       - in: cookie
 *         name: connect.sid
 *         required: true
 *         description: 사용자 세션 쿠키
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 세션 존재 여부에 따라 응답 (세션이 존재하면 SUCCESS, 없으면 ERROR)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"  # 세션이 있을 경우, "ERROR"일 경우도 있음
 *                 message:
 *                   type: string
 *                   example: "세션이 존재합니다."  # 또는 "세션이 없습니다."
 *                 data:
 *                   type: string
 *                   nullable: true
 */
router.get('/session', controller.getSession);

/**
 * @swagger
 * /v1/user:
 *   delete:
 *     summary: 회원탈퇴
 *     description: 로그인한 사용자의 회원탈퇴를 진행합니다. 이메일 사용자는 soft delete 처리하고, 카카오 사용자는 카카오 탈퇴 API 호출 후 탈퇴 처리합니다.
 *     tags: [User]
 *     parameters:
 *       - in: cookie
 *         name: connect.sid
 *         required: true
 *         description: 사용자 인증 쿠키
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회원탈퇴 성공
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
 *                   example: "이메일 회원 탈퇴가 완료되었습니다."  # 또는 "카카오 회원 탈퇴가 완료되었습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: 회원탈퇴 처리 중 서버 오류 발생
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
router.delete('/', controller.deleteMyInfo);

/**
 * @swagger
 * /v1/user/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백
 *     description: 카카오 로그인 후 자동으로 호출되어 사용자를 인증하고, 로그인 성공 시 사용자의 닉네임을 반환합니다.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 카카오 로그인 성공 또는 실패에 따른 응답
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"  # 또는 "ERROR" (로그인 실패 시)
 *                 message:
 *                   type: string
 *                   example: "카카오 로그인에 성공했습니다."  # 또는 "로그인 실패했습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       example: "nickname123"
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
router.get('/kakao/callback', controller.getKakaoCallback);

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
