const express = require('express');
const router = express.Router({ mergeParams: true }); // app.js의 라우터 경로의 params 값을 받아올 수 있도록
const controller = require('../controllers/Ctodos');
const isAuthenticated = require('../middlewares/isAuthenticated'); // 로그인 여부 체크 미들웨어

// todos 라우터의 기본 URL은 todos/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */


/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: 워크스페이스 업무 관련 API
 */

/**
 * @swagger
 * /v1/workspace/{space_id}/todos:
 *   post:
 *     summary: 전체 업무 리스트 조회
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 전체 업무 목록을 가져옴
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
 *                   example: "전체업무 목록을 가져왔습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     done:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad Request
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
 *                   example: "요청값이 올바르지않습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
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
 *                   example: "로그인되지 않은 사용자입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       403:
 *         description: Forbidden
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
 *                   example: "접근 권한이 없습니다."
 *                 data:
 *                   type: object
 *                   nullable: true 
 *       503:
 *         description: Internal Server Error
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
 *
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         todo_id:
 *           type: integer
 *           example: 3
 *         space_id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "explicabo conor terreo"
 *         description:
 *           type: string
 *           example: "Praesentium facere tonsor curto recusandae aut adiuvo. Spes appello volutabrum."
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           example: "low"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-02-03"
 *         due_date:
 *           type: string
 *           format: date
 *           example: "2025-10-11"
 *         status:
 *           type: string
 *           enum: [plan, progress, done]
 *           example: "plan"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-02-26T01:24:56.000Z"
 *         is_deleted:
 *           type: boolean
 *           example: false
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 */
router.post('/', isAuthenticated, controller.postTodoList);

/**
 * @swagger
 * /v1/workspace/{space_id}/todos/statelodeed:
 *   post:
 *     summary: 업무 무한스크롤 조회
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 업무 목록을 가져왔습니다.
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
 *                   example: "업무 목록을 가져왔습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           todo_id:
 *                             type: integer
 *                             example: 1
 *                           space_id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Todo 1 for Workspace 1"
 *                           description:
 *                             type: string
 *                             example: "Dummy todo description"
 *                           priority:
 *                             type: string
 *                             example: "low"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             example: "2025-02-21"
 *                           due_date:
 *                             type: string
 *                             format: date
 *                             example: "2025-02-28"
 *                           status:
 *                             type: string
 *                             example: "plan"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-21T09:19:59.000Z"
 *                           is_deleted:
 *                             type: boolean
 *                             example: false
 *                           deleted_at:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                     progress:
 *                       type: array
 *                       items:
 *                         type: object
 *                     done:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Bad Request
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
 *                   example: "요청값이 올바르지않습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
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
 *                   example: "로그인되지 않은 사용자입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       403:
 *         description: Forbidden
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
 *                   example: "접근 권한이 없습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       503:
 *         description: Internal Server Error
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
router.post("/statelodeed",isAuthenticated, controller.postTodoStateList);

/**
 * @swagger
 * /v1/workspace/{space_id}/todos/add:
 *   post:
 *     summary: 업무생성
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 업무생성 성공
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
 *                   example: "업무를 생성했습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Bad Request
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
 *                   example: "요청값이 올바르지않습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
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
 *                   example: "로그인되지 않은 사용자입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       403:
 *         description: Forbidden
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
 *                   example: "접근 권한이 없습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       503:
 *         description: Internal Server Error
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
router.post('/add', isAuthenticated, controller.postTodoCreate);

/**
 * @swagger
 * /v1/workspace/{space_id}/todos/view/{todo_id}:
 *   post:
 *     summary: 업무 상세 조회
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 특정업무 조회성공에 성공했습니다.
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
 *                   example: "업무 목록을 가져왔습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           todo_id:
 *                             type: integer
 *                             example: 1
 *                           space_id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Todo 1 for Workspace 1"
 *                           description:
 *                             type: string
 *                             example: "Dummy todo description"
 *                           priority:
 *                             type: string
 *                             example: "low"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             example: "2025-02-21"
 *                           due_date:
 *                             type: string
 *                             format: date
 *                             example: "2025-02-28"
 *                           status:
 *                             type: string
 *                             example: "plan"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-21T09:19:59.000Z"
 *                           is_deleted:
 *                             type: boolean
 *                             example: false
 *                           deleted_at:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                     progress:
 *                       type: array
 *                       items:
 *                         type: object
 *                     done:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Bad Request
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
 *                   example: "요청값이 올바르지않습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
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
 *                   example: "로그인되지 않은 사용자입니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       403:
 *         description: Forbidden
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
 *                   example: "접근 권한이 없습니다."
 *                 data:
 *                   type: object
 *                   nullable: true
 *       503:
 *         description: Internal Server Error
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
router.post('/view/:todo_id', isAuthenticated, controller.postTodo);
router.patch('/:todo_id', isAuthenticated, controller.patchTodo);
router.delete('/:todo_id', isAuthenticated, controller.deleteTodo);
router.delete('/permanent/:todo_id',isAuthenticated,controller.deleteHardDeleteTodo);
router.patch('/restore/:todo_id', isAuthenticated, controller.restoreTodo);
router.patch('/state/:todo_id', isAuthenticated, controller.patchTodoState);

// // 전체 업무 리스트 조회
// router.post("/", isAuthenticated, controller.postTodoList);
// // 업무 생성
// router.post("/add", isAuthenticated, controller.postTodoCreate);
// // 특정 업무 조회
// router.post("/view/:todo_id",isAuthenticated, controller.postTodo);
// // 업무 수정
// router.patch("/:todo_id",isAuthenticated, controller.patchTodo);
// // 업무 소프트 삭제
// router.delete("/:todo_id",isAuthenticated, controller.deleteTodo);
// // 업무 하드 삭제
// router.delete("/permanent/:todo_id",isAuthenticated, controller.deleteHardDeleteTodo);
// // 소프트 삭제 복구
// router.patch("/restore/:todo_id",isAuthenticated, controller.restoreTodo);
// // 업무 상태 변경
// router.patch("/state/:todo_id",isAuthenticated, controller.patchTodoState);
// // 소프트 딜리트된 업무 복구
// router.patch("/restore/:todo_id",isAuthenticated, controller.restoreTodo);

module.exports = router;
