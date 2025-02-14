const express = require('express');
const router = express.Router();
const controller = require('../controllers/Cuser');

// 회원가입
router.post('/v1/user/join', controller.postJoin);

module.exports = router;
