const db = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');

exports.getTest = (req, res) => {
  res.send({ message: 'test' });
};

// 회원가입 POST /api/user/join
exports.postJoin = async (req, res) => {
  try {
    const { email, password_hash, nickname } = req.body;
    console.log(email);
    console.log(password_hash);
    console.log(nickname);
    if (!email || !password_hash || !nickname) {
      return res.send({
        status: 'ERROR',
        message: '이메일, 비번, 닉네임을 모두 입력해주세요.',
        data: null,
      });
    }
    const existsEmail = await User.findOne({ where: { email } });

    if (existsEmail) {
      return res.send({
        status: 'ERROR',
        message: '이미 가입된 사용자 입니다.',
        data: null,
      });
    }
    const hasedPassword = await bcrypt.hash(password_hash, 10);
    const newUser = await User.create({
      email,
      password_hash: hasedPassword,
      nickname,
      auth_provider: 'email',
    });

    return res.send({
      status: 'SUCCESS',
      message: '회원가입이 성공되었습니다.',
      data: { nickname: newUser.nickname },
    });
  } catch (err) {
    console.log('error', err);
    return res.send({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};

// 닉네임 중복 확인 GET /v1/user/check-name
exports.getCheckName = async (req, res) => {
  try {
    const { nickname } = req.query;
    const existName = await User.findOne({ where: { nickname } });
    if (existName) {
      return res.send({
        status: 'ERROR',
        message: '중복된 닉네임이 존재합니다.',
        data: null,
      });
    }
    return res.send({
      status: 'SUCCESS',
      message: '사용가능한 닉네임입니다.',
      data: null,
    });
  } catch (err) {
    console.log('error', err);
    return res.send({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};

// 이메일 중복 확인 GET /v1/user/check-email
exports.getCheckEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      return res.send({
        status: 'ERROR',
        message: '중복된 이메일이 존재합니다.',
        data: null,
      });
    }
    return res.send({
      statue: 'SUCCESS',
      message: '사용가능한 이메일입니다.',
      data: null,
    });
  } catch (err) {
    console.log('error', err);
    return res.send({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};

// 이메일 기반 로그인 POST /v1/user/login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.send({
        status: 'ERROR',
        message: info.message || '로그인 실패했습니다.',
        data: null,
      });
    }

    req.login(user, (loginInErr) => {
      if (loginInErr) return next(loginInErr);

      // console.log('현재 세션:', req.session); // 세션 확인

      return res.send({
        status: 'SUCCESS',
        message: '로그인 성공했습니다.',
        data: { nickname: user.nickname },
      });
    });
  })(req, res, next);
};

// 카카오 기반 로그인 GET /v1/user/kakao-login
exports.getKakaoLogin = passport.authenticate('kakao');

// 클라언트가 호출 할 필요 없이 자동으로 호출됨
exports.getKakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.send({
        statue: 'ERROR',
        messge: '로그인 실패했습니다.',
        data: null,
      });
    }

    // 로그인 성공 시 세션 저장
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      // console.log("세션 확인", req.session); // 세션 확인

      return res.send({
        status: 'SUCCESS',
        message: '카카오 로그인 성공했습니다.',
        data: {
          nickname: user.nickname,
        },
      });
    });
  })(req, res, next);
};
