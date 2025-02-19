const db = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');
const axios = require('axios');
const { Op, Sequelize } = require('sequelize');

exports.getTest = (req, res) => {
  res.send({ message: 'test' });
};

// 회원가입 POST /api/user/join
exports.postJoin = async (req, res) => {
  try {
    const { email, password_hash, nickname, profile_image } = req.body;
    console.log(email);
    console.log(password_hash);
    console.log(nickname);
    console.log(profile_image);
    if (!email || !password_hash || !nickname || !profile_image) {
      return res.send({
        status: 'ERROR',
        message: '이메일, 비번, 닉네임을 모두 입력해주세요.',
        data: null,
      });
    }
    const existsEmail = await User.findOne({
      where: { email },
      paranoid: false,
    });

    // 이미 탈퇴한 계정이라면
    if (existsEmail && existsEmail.deleted_at) {
      return res.send({
        status: 'ERROR',
        message: '탈퇴한 계정입니다. 복구를 원하시면 관리자에게 문의하세요.',
        data: null,
      });
    }
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
      profile_image,
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
    const { nickname } = req.body;
    const existName = await User.findOne({
      where: Sequelize.literal(`BINARY nickname = '${nickname}'`),
    });
    console.log(existName);
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
    const { email } = req.body;
    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      return res.send({
        status: 'ERROR',
        message: '중복된 이메일이 존재합니다.',
        data: null,
      });
    }
    return res.send({
      status: 'SUCCESS',
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
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.send({
        status: 'ERROR',
        message: info.message || '로그인 실패했습니다.',
        data: null,
      });
    }

    const userData = await User.findOne({
      where: { user_id: user_id },
      paranoid: false,
    });

    if (userData && userData.deleted_at) {
      return res.send({
        status: 'ERROR',
        message: '탈퇴한 회원입니다. 복구를 원하시면 관리자에게 문의하세요.',
        data: null,
      });
    }

    req.login(user, (loginInErr) => {
      if (loginInErr) return next(loginInErr);

      console.log('이메일 로그인 현재 세션:', req.session); // 세션 확인

      return res.send({
        status: 'SUCCESS',
        message: '로그인 성공했습니다.',
        data: { nickname: user.nickname },
      });
    });
  })(req, res, next);
};

// 카카오 기반 로그인 GET /v1/user/kakao-login
exports.getKakaoLogin = (req, res, next) => {
  passport.authenticate('kakao')(req, res, next);
};

// 클라언트가 호출 할 필요 없이 자동으로 호출됨
exports.getKakaoCallback = (req, res, next) => {
  passport.authenticate('kakao', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({
        status: 'ERROR',
        message: '로그인 실패했습니다.',
        data: null,
      });
    }

    const userData = await User.findOne({
      where: { user_id: user_id },
      paranoid: false,
    });

    if (userData && userData.deleted_at) {
      return res.send({
        status: 'ERROR',
        message: '탈퇴한 회원입니다. 복구를 원하시면 관리자에게 문의하세요.',
        data: null,
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.session.save((err) => {
        if (err) return next(err);

        return res.send({
          status: 'SUCCESS',
          message: '카카오 로그인 성공!',
          data: { nickname: user.nickname },
        });
      });
    });
  })(req, res, next);
};

// 이메일 기반 로그아웃 POST /v1/user/logout
exports.postLogout = (req, res) => {
  console.log('로그아웃 전 세션 확인', req.session);
  req.logout((err) => {
    req.session.destroy((sessionErr) => {
      if (sessionErr) return next(sessionErr);

      res.clearCookie('connect.sid');
      return res.send({
        status: 'SUCCESS',
        message: '로그아웃 성공했습니다.',
        data: null,
      });
    });
  });
};

// 카카오 로그아웃 POST /v1/user/kakao-logout
exports.postKakaoLogout = async (req, res, next) => {
  console.log('로그아웃 전 세션 확인', req.session);
  try {
    if (!req.session.passport || !req.session.passport.user) {
      return res.send({
        status: 'ERROR',
        message: '로그인 상태가 아닙니다.',
        data: null,
      });
    }

    const accessToken = req.session.passport.user.access_token;

    if (!accessToken) {
      return res.send({
        status: 'ERROR',
        message: '액세스 토큰이 존재하지 않습니다.',
        data: null,
      });
    }

    // 1. 카카오 API에 로그아웃 요청
    await axios.post('https://kapi.kakao.com/v1/user/logout', null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 2. 세션 삭제 및 로그아웃 처리
    req.logout((err) => {
      if (err) return next(err);

      req.session.destroy((sessionErr) => {
        if (sessionErr) return next(sessionErr);

        res.clearCookie('connect.sid');

        return res.send({
          status: 'SUCCESS',
          message: '카카오 로그아웃 성공했습니다.',
          data: null,
        });
      });
    });
  } catch (err) {
    return res.send({
      status: 'ERROR',
      message: '카카오 로그아웃 실패했습니다.',
      error: err.message,
    });
  }
};

// 현재 로그인한 사용자 세션 확인 GET /v1/user/session
exports.getSession = (req, res) => {
  console.log(req.session);
  res.send({ message: req.session });
};

// 회원탈퇴 DELETE /v1/user
// 이메일 -> 세션 삭제 후 soft delete 처리
// 카카오 -> 카카오 탈퇴 API 호출 후 세션 삭제 및 soft delete 처리
exports.deleteMyInfo = async (req, res) => {
  try {
    if (!req.session.passport || !req.session.passport.user) {
      return res.send({
        status: 'ERROR',
        message: '로그인 상태가 아닙니다.',
        data: null,
      });
    }

    const { user_id: userId } = req.session.passport.user;

    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return res.status.send({
        status: 'ERROR',
        message: '사용자를 찾을 수 없습니다.',
        data: null,
      });
    }

    if (user.auth_provider === 'email') {
      await user.update({ deleted_at: new Date() });
      return logoutAndDestroySession(
        req,
        res,
        '이메일 회원 탈퇴가 완료되었습니다.'
      );
    }

    if (user.auth_provider === 'kakao') {
      const accessToken = req.session.passport.user.access_token;

      if (!accessToken) {
        return res.send({
          status: 'ERROR',
          message: '카카오 액세스 토큰을 찾을 수 없습니다.',
          data: null,
        });
      }

      await axios.post('https://kapi.kakao.com/v1/user/unlink', null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      await user.update({ deleted_at: new Date() });

      return logoutAndDestroySession(
        req,
        res,
        '카카오 회원 탈퇴가 완료되었습니다.'
      );
    }

    return res.send({
      status: 'ERROR',
      message: '알수 없는 인증입니다.',
    });
  } catch (err) {
    console.log('err', err);
    res.send({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};

const logoutAndDestroySession = (req, res, successMessage) => {
  req.logout((err) => {
    if (err)
      return res.send({
        status: 'ERROR',
        message: '로그아웃 중 오류가 발생했습니다.',
      });

    req.session.destroy((sessionErr) => {
      if (sessionErr)
        return res.send({
          status: 'ERROR',
          message: '세션 삭제 실패했습니다.',
        });

      res.clearCookie('connect.sid');
      return res.send({
        status: 'SUCCESS',
        message: successMessage,
      });
    });
  });
};
