const express = require('express');
const router = express.Router();
const controller = require('../controllers/Cuser');

// 회원가입
router.post('/join', controller.postJoin);

// 닉네임 중복 확인
router.get('/check-name', controller.getCheckName);

// 이메일 중복 확인
router.get('/check-email', controller.getCheckEmail);

// 이메일 기반 로그인
router.post('/login', controller.postLogin);

module.exports = router;
