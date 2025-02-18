const express = require("express");
const router = express.Router({ mergeParams: true }); // app.js의 라우터 경로의 params 값을 받아올 수 있도록
const controller = require("../controllers/Ctodos");

// todos 라우터의 기본 URL은 todos/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

// 전체 업무 리스트 조회
router.post("/", controller.postTodoList);
// 업무 생성
router.post("/add", controller.postTodoCreate);
// 특정 업무 조회
router.post("/view/:todo_id", controller.postTodo);
// 업무 수정
router.patch("/:todo_id", controller.patchTodo);
// 업무 삭제
router.delete("/:todo_id", controller.deleteTodo);
// 업무 상태 변경
router.patch("/state/:todo_id", controller.patchTodoState);

module.exports = router;

