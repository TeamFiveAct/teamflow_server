const express = require("express");
const controller = require("../controllers/Cuser");
const router = express.Router();

// user 라우터의 기본 URL은 user/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

// 사용자 정보조회 라우터
router.get("/", controller.join);
// 사용자 정보수정 라우터
router.patch("/", controller.join);
// 회원탈퇴
router.delete("/", controller.join);
// 회원가입
router.post("/join", controller.join);
// 닉네임 중복확인
router.get("/check-name", controller.join);
// 이메일 중복확인
router.get("/check-email", controller.join);
// 사용자 로그인(이메일 기반)
router.post("/login", controller.join);
// 사용자 로그아웃(이메일 기반)
router.post("/logout", controller.join);
// 사용자 로그인(카카오기반)
router.post("/kakao-login", controller.join);
// 사용자 로그아웃(카카오기반)
router.post("/kakao-logout", controller.join);

module.exports = router;
