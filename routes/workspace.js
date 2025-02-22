const express = require('express');
const controller = require('../controllers/Cworkspace');
const router = express.Router({ mergeParams: true });
const isAuthenticated = require('../middlewares/isAuthenticated'); // 로그인 여부 체크 미들웨어

// workspace 라우터의 기본 URL은 workspace/ 입니다!!!
/* 컨트롤러의 이름은 임의로 설정하였으니 각각 용도에 맞춰 작성해주세요~ 😀 */

// 워크스페이스 생성
router.post("/", isAuthenticated, controller.postSpaceCreate);
// 현재 사용자가 참여한 모든 워크스페이스 조회 (GET)
router.get('/user', isAuthenticated, controller.getMySpace);
// 워크스페이스 초대 
router.post("/invite", isAuthenticated, controller.postSpaceInvite);
// 워크스페이스 참여 신청 (초대 코드 입력 후 참여)
router.post('/join', isAuthenticated, controller.postSpaceJoin);
// 특정 워크스페이스 조회
router.get('/:space_id', isAuthenticated, controller.getSpace);
// 특정 워크스페이스 멤버 조회 (GET이 더 적절)
router.get("/:space_id/member", isAuthenticated, controller.getSpaceMember);



module.exports = router;

