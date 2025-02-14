const db = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.join = (req, res) => {
  console.log('user! join 컨트롤러!');
  res.send({ msg: 'user' });
};

exports.postJoin = async (req, res) => {
  try {
    const { email, password_hash, nickname } = req.body;
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
