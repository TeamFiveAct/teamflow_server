const express = require("express");
const controller = require("../controllers/Cworkspace");
const router = express.Router({ mergeParams: true });
const isAuthenticated = require('../middlewares/isAuthenticated'); // 로그인 여부 체크 미들웨어

// workspace 라우터의 기본 URL은 workspace/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

// 워크스페이스 생성
router.post("/",isAuthenticated, controller.postSpaceCreate);

// 개인별 참여한 워크스페이스 모두 조회
router.get("/user",isAuthenticated, controller.getMySpace);

// 특정 워크스페이스 조회
router.get("/:space_id",isAuthenticated, controller.getSpace);

// 워크스페이스 참여 신청
router.post("/join",isAuthenticated, controller.postSpaceJoin);

// 워크스페이스 참여자 전체 조회
router.post("/:space_id/member",isAuthenticated, controller.postSpaceMember);


module.exports = router;