const express = require("express");
const controller = require("../controllers/Ctodos");
const router = express.Router();

// todos 라우터의 기본 URL은 todos/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */
router.post("/", controller.postTodoList);
router.post("/add", controller.postTodoCreate);
router.post("/:todo_id", controller.postTodo);

module.exports = router;
