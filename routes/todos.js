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
 *   description: 업무 관련 API (수정진행중!!!)
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: 전체 업무 리스트 조회
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 성공적으로 전체 업무 리스트를 반환함
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
 *                   title:
 *                     type: string
 *                     example: "업무 제목"
 *                   description:
 *                     type: string
 *                     example: "업무 설명"
 */
router.post('/', isAuthenticated, controller.postTodoList);



router.post("/statelodeed",isAuthenticated, controller.postTodoStateList);




/**
 * @swagger
 * /todos/add:
 *   post:
 *     summary: 업무 생성
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "새로운 업무"
 *               description:
 *                 type: string
 *                 example: "업무 상세 내용"
 *     responses:
 *       201:
 *         description: 업무가 성공적으로 생성됨
 */
router.post('/add', isAuthenticated, controller.postTodoCreate);

/**
 * @swagger
 * /todos/view/{todo_id}:
 *   post:
 *     summary: 특정 업무 조회
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 업무 ID
 *     responses:
 *       200:
 *         description: 특정 업무 정보를 반환함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "업무 제목"
 *                 description:
 *                   type: string
 *                   example: "업무 설명"
 */
router.post('/view/:todo_id', isAuthenticated, controller.postTodo);

/**
 * @swagger
 * /todos/{todo_id}:
 *   patch:
 *     summary: 업무 수정
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 업무 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "수정된 업무 제목"
 *               description:
 *                 type: string
 *                 example: "수정된 업무 설명"
 *     responses:
 *       200:
 *         description: 업무가 성공적으로 수정됨
 */
router.patch('/:todo_id', isAuthenticated, controller.patchTodo);

/**
 * @swagger
 * /todos/{todo_id}:
 *   delete:
 *     summary: 업무 소프트 삭제
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 업무 ID
 *     responses:
 *       200:
 *         description: 업무가 성공적으로 소프트 삭제됨
 */
router.delete('/:todo_id', isAuthenticated, controller.deleteTodo);

/**
 * @swagger
 * /todos/permanent/{todo_id}:
 *   delete:
 *     summary: 업무 하드 삭제
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 영구 삭제할 업무 ID
 *     responses:
 *       200:
 *         description: 업무가 성공적으로 영구 삭제됨
 */
router.delete(
  '/permanent/:todo_id',
  isAuthenticated,
  controller.deleteHardDeleteTodo
);

/**
 * @swagger
 * /todos/restore/{todo_id}:
 *   patch:
 *     summary: 소프트 삭제된 업무 복구
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 복구할 업무 ID
 *     responses:
 *       200:
 *         description: 업무가 성공적으로 복구됨
 */
router.patch('/restore/:todo_id', isAuthenticated, controller.restoreTodo);

/**
 * @swagger
 * /todos/state/{todo_id}:
 *   patch:
 *     summary: 업무 상태 변경
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: todo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상태를 변경할 업무 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 example: "완료"
 *     responses:
 *       200:
 *         description: 업무 상태가 성공적으로 변경됨
 */
router.patch('/state/:todo_id', isAuthenticated, controller.patchTodoState);



module.exports = router;
