const express = require("express");
const controller = require("../controllers/Cworkspace");
const router = express.Router();

// workspace 라우터의 기본 URL은 workspace/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

// 워크스페이스 생성 라우터
router.post("/", controller.index);

// 특정 워크스페이스 조회 라우터
router.get("/:space_id", controller.index);

// 워크스페이스 참여 신청 라우터
router.post("/join", controller.index);

// 개인별 참여한 워크스페이스 모두 조회 라우터
router.get("/user", controller.index);

module.exports = router;
