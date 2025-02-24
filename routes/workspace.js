const express = require('express');
const controller = require('../controllers/Cworkspace');
const router = express.Router({ mergeParams: true });
const isAuthenticated = require('../middlewares/isAuthenticated'); // 로그인 여부 체크 미들웨어

// workspace 라우터의 기본 URL은 workspace/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: 워크스페이스 관련 API (수정진행중!!!)
 */

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: 워크스페이스 생성
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "내 워크스페이스"
 *               description:
 *                 type: string
 *                 example: "프로젝트 협업을 위한 공간"
 *     responses:
 *       201:
 *         description: 워크스페이스가 성공적으로 생성됨
 */
router.post('/', isAuthenticated, controller.postSpaceCreate);

/**
 * @swagger
 * /workspaces/user:
 *   get:
 *     summary: 현재 사용자가 참여한 모든 워크스페이스 조회
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자가 속한 워크스페이스 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "내 워크스페이스"
 */
router.get('/user', isAuthenticated, controller.getMySpace);

/**
 * @swagger
 * /workspaces/invite:
 *   post:
 *     summary: 워크스페이스 초대
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               space_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: 초대가 성공적으로 전송됨
 */
router.post('/invite', isAuthenticated, controller.postSpaceInvite);

/**
 * @swagger
 * /workspaces/join:
 *   post:
 *     summary: 워크스페이스 참여 신청 (초대 코드 입력 후 참여)
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invite_code:
 *                 type: string
 *                 example: "ABC123"
 *     responses:
 *       200:
 *         description: 워크스페이스에 성공적으로 참여됨
 */
router.post('/join', isAuthenticated, controller.postSpaceJoin);

/**
 * @swagger
 * /workspaces/{space_id}:
 *   get:
 *     summary: 특정 워크스페이스 조회
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: space_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 워크스페이스 ID
 *     responses:
 *       200:
 *         description: 특정 워크스페이스 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "내 워크스페이스"
 */
router.get('/:space_id', isAuthenticated, controller.getSpace);

/**
 * @swagger
 * /workspaces/{space_id}/member:
 *   get:
 *     summary: 특정 워크스페이스 멤버 조회
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: space_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 워크스페이스 ID
 *     responses:
 *       200:
 *         description: 해당 워크스페이스 멤버 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "홍길동"
 */
router.get('/:space_id/member', isAuthenticated, controller.getSpaceMember);

// // 워크스페이스 생성
// router.post("/", isAuthenticated, controller.postSpaceCreate);
// // 현재 사용자가 참여한 모든 워크스페이스 조회 (GET)
// router.get('/user', isAuthenticated, controller.getMySpace);
// // 워크스페이스 참여 신청 (초대 코드 입력 후 참여)
// router.post('/join', isAuthenticated, controller.postSpaceJoin);
// // 특정 워크스페이스 조회
// router.get('/:space_id', isAuthenticated, controller.getSpace);
// // 특정 워크스페이스 멤버 조회 (GET이 더 적절)
// router.get("/:space_id/member", isAuthenticated, controller.getSpaceMember);
// // 워크스페이스 초대
// router.post("/:space_id/invite", isAuthenticated, controller.postSpaceInvite);

module.exports = router;
