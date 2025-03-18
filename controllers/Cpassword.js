// controllers/Cpassword.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { User, PasswordReset } = require('../models');
const { Op } = require('sequelize');
const sendEmailMiddleware = require('../middlewares/emailMiddleware'); // 이메일 미들웨어 import

class PasswordController {
  // 비밀번호 재설정 요청 처리
  static async requestReset(req, res) {
    try {
      const { email } = req.body;

      // 이메일로 사용자 찾기
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res
          .status(404)
          .json({ message: '해당 이메일로 등록된 사용자를 찾을 수 없습니다.' });
      }

      // 랜덤 토큰 생성
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료

      // 토큰을 데이터베이스에 저장
      await PasswordReset.create({
        user_id: user.user_id,
        token,
        expires_at: expiresAt,
      });

      // 이메일 내용 준비
      const resetLink = `http://localhost:8000/v1/user/reset-password?token=${token}`;
      req.body.to = email;
      req.body.subject = '[TeamFlow] 비밀번호 재설정 요청';
      req.body.html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>비밀번호 재설정 요청</title>
      </head>
      <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" width="600" style="border-collapse: collapse; background-color: #ffffff; margin-top: 30px; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #1a73e8; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">TeamFlow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333;">비밀번호 재설정 요청</h2>
              <p style="color: #555555;">안녕하세요,</p>
              <p style="color: #555555;">귀하의 계정 비밀번호 재설정 요청을 확인하였습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요. 이 링크는 30분 동안만 유효합니다.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="background-color: #1a73e8; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-size: 16px;">비밀번호 재설정</a>
              </div>
              <p style="color: #555555;">만약 이 요청을 본인이 한 것이 아니라면, 이 이메일을 무시해 주세요.</p>
              <p style="color: #555555;">감사합니다.</p>
              <p style="color: #555555;">TeamFlow 팀 드림</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px;">
              <p style="margin: 0;">이메일 수신에 문제가 있으시면 고객 지원에 문의해 주세요.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    

      // 이메일 미들웨어를 사용해 이메일 전송 (Promise로 래핑하여 대기)
      await new Promise((resolve, reject) => {
        sendEmailMiddleware(req, res, () => {
          resolve();
        });
      });

      // 이메일 전송 후 응답 전송
      res.status(200).json({
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
        emailStatus: req.emailStatus, // "success" 또는 "failed" 상태 확인 가능
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        message: '비밀번호 재설정 요청 중 오류가 발생했습니다.',
      });
    }
  }

  // 비밀번호 재설정 페이지 렌더링
  static async renderResetPage(req, res) {
    try {
      const { token } = req.query;
      if (!token) {
        return res.render('reset-password', {
          error: '유효하지 않은 토큰입니다.',
          token: '',
        });
      }

      // 토큰 유효성 검사
      const resetRequest = await PasswordReset.findOne({
        where: {
          token,
          used: false,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (!resetRequest) {
        return res.render('reset-password', {
          error: '만료되었거나 유효하지 않은 토큰입니다.',
          token: '',
        });
      }

      res.render('reset-password', { error: null, token });
    } catch (error) {
      console.error('Reset page render error:', error);
      res.render('reset-password', {
        error: '페이지를 로드하는 중 오류가 발생했습니다.',
        token: '',
      });
    }
  }

  // 비밀번호 재설정 처리

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      // 유효한 토큰 찾기
      const resetRequest = await PasswordReset.findOne({
        where: {
          token,
          used: false,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (!resetRequest) {
        return res.status(400).json({
          success: false,
          message: '만료되었거나 유효하지 않은 토큰입니다.',
        });
      }

      // 새 비밀번호 해시화
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자의 비밀번호 업데이트
      await User.update(
        { password_hash: hashedPassword },
        { where: { user_id: resetRequest.user_id } }
      );

      // 토큰 사용 처리
      await resetRequest.update({ used: true });

      return res.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        message: '비밀번호 재설정 중 오류가 발생했습니다.',
      });
    }
  }
}

module.exports = PasswordController;
