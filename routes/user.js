const express = require('express');
const router = express.Router();
const controller = require('../controllers/Cuser');

// 회원가입
router.post('/v1/user/join', controller.postJoin);

// 닉네임 중복 확인
router.get('/v1/user/check-name', controller.getCheckName);

module.exports = router;
