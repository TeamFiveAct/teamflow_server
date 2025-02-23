//controllers\Cuser.js
const db = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');
const axios = require('axios');
const { Op, Sequelize } = require('sequelize');
const responseUtil = require('../utils/ResponseUtil');

// 테스트 API
exports.getTest = (req, res) => {
  res.send({ message: 'test' });
};

// 회원가입 POST /api/user/join
exports.postJoin = async (req, res) => {
  try {
    const { email, password_hash, nickname, profile_image } = req.body;
    if (!email || !password_hash || !nickname || !profile_image) {
      return res.send(
        responseUtil('ERROR', '이메일, 비번, 닉네임을 모두 입력해주세요.', null)
      );
    }
    const existsEmail = await User.findOne({
      where: { email },
      paranoid: false,
    });

    // 이미 탈퇴한 계정이라면
    if (existsEmail && existsEmail.deleted_at) {
      return res.send(
        responseUtil(
          'ERROR',
          '탈퇴한 계정입니다. 복구를 원하시면 관리자에게 문의하세요.',
          null
        )
      );
    }
    if (existsEmail) {
      return res.send(responseUtil('ERROR', '이미 가입된 사용자입니다.', null));
    }
    const hasedPassword = await bcrypt.hash(password_hash, 10);
    const newUser = await User.create({
      email,
      password_hash: hasedPassword,
      nickname,
      auth_provider: 'email',
      profile_image,
    });
    return res.send(
      responseUtil('SUCCESS', '회원가입이 성공되었습니다.', {
        nickname: newUser.nickname,
      })
    );
  } catch (err) {
    console.log('error', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 닉네임 중복 확인 GET /v1/user/check-name
exports.getCheckName = async (req, res) => {
  try {
    const { nickname } = req.query;
    const existName = await User.findOne({
      where: Sequelize.literal(`BINARY nickname = '${nickname}'`),
    });
    console.log(existName);
    if (existName) {
      return res.send(
        responseUtil('ERROR', '중복된 닉네임이 존재합니다.', null)
      );
    }
    return res.send(responseUtil('SUCCESS', '사용가능한 닉네임입니다.', null));
  } catch (err) {
    console.log('error', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 이메일 중복 확인 GET /v1/user/check-email
exports.getCheckEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      return res.send(
        responseUtil('ERROR', '중복된 이메일이 존재합니다.', null)
      );
    }
    return res.send(responseUtil('SUCCESS', '사용가능한 이메일입니다.', null));
  } catch (err) {
    console.log('error', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 이메일 기반 로그인 POST /v1/user/login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.send(
        responseUtil('ERROR', info.message || '로그인 실패했습니다.', null)
      );
    }

    const userData = await User.findOne({
      where: { email: req.body.email },
      paranoid: false,
    });

    if (userData && userData.deleted_at) {
      return res.send(
        responseUtil(
          'ERROR',
          '탈퇴한 회원입니다. 복구를 원하시면 관리자에게 문의하세요.',
          null
        )
      );
    }

    req.login(user, (loginInErr) => {
      if (loginInErr) return next(loginInErr);

      //console.log('이메일 로그인 현재 세션:', req.session); // 세션 확인

      return res.send(
        responseUtil('SUCCESS', '로그인 성공했습니다.', {
          nickname: user.nickname,
        })
      );
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
      return res.send(responseUtil('ERROR', '로그인 실패했습니다.', null));
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.session.save((err) => {
        if (err) return next(err);

        return res.send(
          responseUtil('SUCCESS', '카카오 로그인에 성공했습니다.', {
            nickname: user.nickname,
          })
        );
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
      return res.send(responseUtil('SUCCESS', '로그아웃 성공했습니다.', null));
    });
  });
};

// 카카오 로그아웃 POST /v1/user/kakao-logout
exports.postKakaoLogout = async (req, res, next) => {
  console.log('로그아웃 전 세션 확인', req.session);
  try {
    if (!req.session.passport || !req.session.passport.user) {
      return res.send(responseUtil('ERROR', '로그인 상태가 아닙니다.', null));
    }

    const accessToken = req.session.passport.user.access_token;

    if (!accessToken) {
      return res.send(
        responseUtil('ERROR', '액세스 토큰이 존재하지 않습니다.', null)
      );
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
        return res.send(
          responseUtil('SUCCESS', '카카오 로그아웃 성공했습니다.', null)
        );
      });
    });
  } catch (err) {
    return res.send(
      responseUtil('ERROR', '카카오 로그아웃 실패했습니다.', null)
    );
  }
};

// 사용자 정보 조회 GET /v1/user/info
exports.getUserInfo = async (req, res) => {
  try {
    // 로그인 상태 확인
    if (!req.session.passport || !req.session.passport.user) {
      return res.send(responseUtil('ERROR', '로그인 상태가 아닙니다.', null));
    }

    const { user_id } = req.session.passport.user;
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.send(
        responseUtil('ERROR', '사용자 정보를 찾을 수 없습니다.', null)
      );
    }

    // 민감한 정보는 제외하고 사용자 정보를 반환합니다.
    const {
      email,
      nickname,
      profile_image,
      auth_provider,
      kakao_id,
      created_at,
    } = user;
    return res.send(
      responseUtil('SUCCESS', '정보 조회에 성공했습니다.', {
        user_id,
        email,
        nickname,
        profile_image,
        auth_provider,
        kakao_id,
        created_at,
      })
    );
  } catch (err) {
    console.log('getUserInfo error:', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 사용자 정보 수정 PUT /v1/user/info
exports.updateUserInfo = async (req, res) => {
  try {
    // 로그인 상태 확인
    if (!req.session.passport || !req.session.passport.user) {
      return res.send(responseUtil('ERROR', '로그인 상태가 아닙니다.', null));
    }

    const { user_id } = req.session.passport.user;
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.send(
        responseUtil('ERROR', '사용자 정보를 찾을 수 없습니다.', null)
      );
    }

    // 클라이언트로부터 수정할 필드를 받아옵니다.
    // 예제에서는 email, nickname, profile_image, 그리고 password(평문)를 허용합니다.
    const { email, nickname, profile_image, password } = req.body;
    let updateData = {};

    // 이메일 수정 시 중복 체크 (현재 사용자의 이메일은 제외)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        where: { email, user_id: { [Op.ne]: user_id } },
      });
      if (emailExists) {
        return res.send(
          responseUtil('ERROR', '이미 사용중인 이메일입니다.', null)
        );
      }
      updateData.email = email;
    }

    // 닉네임 수정 시 중복 체크 (BINARY 비교, 현재 사용자는 제외)
    if (nickname && nickname !== user.nickname) {
      const nicknameExists = await User.findOne({
        where: Sequelize.literal(
          `BINARY nickname = '${nickname}' AND user_id != ${user_id}`
        ),
      });
      if (nicknameExists) {
        return res.send(
          responseUtil('ERROR', '이미 사용중인 닉네임입니다.', null)
        );
      }
      updateData.nickname = nickname;
    }

    // 프로필 이미지 수정
    if (profile_image) {
      updateData.profile_image = profile_image;
    }

    // 비밀번호 수정 (평문이 전달되면 bcrypt로 해싱)
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password_hash = hashedPassword;
    }

    // 업데이트할 내용이 없는 경우
    if (Object.keys(updateData).length === 0) {
      return res.send(responseUtil('SUCCESS', '변경사항이 없습니다.', null));
    }

    await user.update(updateData);
    return res.send(
      responseUtil(
        'SUCCESS',
        '사용자 정보가 성공적으로 업데이트되었습니다.',
        updateData
      )
    );
  } catch (err) {
    console.log('updateUserInfo error:', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 현재 로그인한 사용자 세션 확인 GET /v1/user/session
exports.getSession = (req, res) => {
  console.log(req.session);
  if (req.session.passport) {
    return res.send(responseUtil('SUCCESS', '세션이 존재합니다.', req.session.passport.user.auth_provider));
  }
  return res.send(responseUtil('ERROR', '세션이 없습니다.', null));
};

// 회원탈퇴 DELETE /v1/user
// 이메일 -> 세션 삭제 후 soft delete 처리
// 카카오 -> 카카오 탈퇴 API 호출 후 세션 삭제 및 soft delete 처리
exports.deleteMyInfo = async (req, res) => {
  try {
    if (!req.session.passport || !req.session.passport.user) {
      return res.send(responseUtil('ERROR', '로그인 상태가 아닙니다.', null));
    }

    const { user_id: userId } = req.session.passport.user;

    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return res.send(
        responseUtil('ERROR', '사용자를 찾을 수 없습니다.', null)
      );
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
        return res.send(
          responseUtil('ERROR', '카카오 액세스 토큰을 찾을 수 없습니다.', null)
        );
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

    return res.send(responseUtil('ERROR', '알수 없는 인증입니다.', null));
  } catch (err) {
    console.log('err', err);
    return res.send(responseUtil('ERROR', '서버 오류가 발생했습니다.', null));
  }
};

// 세션 삭제
const logoutAndDestroySession = (req, res, successMessage) => {
  req.logout((err) => {
    if (err)
      return res.send(
        responseUtil('ERROR', '로그아웃 중 오류가 발생했습니다.', null)
      );

    req.session.destroy((sessionErr) => {
      if (sessionErr)
        return res.send(responseUtil('ERROR', '세션 삭제 실패했습니다.', null));

      res.clearCookie('connect.sid');
      return res.send(responseUtil('SUCCESS', successMessage, null));
    });
  });
};
