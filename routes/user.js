const express = require('express');
const router = express.Router();
const controller = require('../controllers/Cuser');

// test
router.get('/test', controller.getTest);

// 회원가입
router.post('/join', controller.postJoin);

// 닉네임 중복 확인
router.get('/check-name', controller.getCheckName);

// 이메일 중복 확인
router.get('/check-email', controller.getCheckEmail);

// 이메일 기반 로그인
router.post('/login', controller.postLogin);

// 카카오 기반 로그인
router.get('/kakao-login', controller.getKakaoLogin);

// 카카오 로그인 콜백 함수 (카카오 로그인 성공/실패시) - 클라이언트에서 호출해줄필요없이 리다이렉트 됨
router.get('/kakao/callback', controller.getKakaoCallback);

module.exports = router;
