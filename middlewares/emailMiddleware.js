const env = 'localDev';
const config = require(__dirname + '/../config/config.json')[env];
const nodemailer = require("nodemailer");

// Nodemailer SMTP 설정
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  // SMTP 서버 주소 (Gmail)
    port: 465,               // SSL 포트 (465: SSL, 587: TLS)
    secure: true,            // true: SSL 사용, false: TLS 사용
    auth: {
        user: "revecloud7@gmail.com",
        pass: config.emailPass,
    },
});

// 이메일 미들웨어
const sendEmailMiddleware = (req, res, next) => {
    const { to, subject, text, html } = req.body;

    // 필수 정보가 없으면 그냥 넘김 (이메일이 필수가 아닐 경우)
    if (!to || !subject || (!text && !html)) {
        return next();
    }

    const mailOptions = {
        from: '"TeamFlow CS팀" <revecloud@gmail.com>',
        to,
        subject,
        text,
        html,
    };

    // 이메일 전송
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("이메일 전송 실패:", error);
            req.emailStatus = "failed"; // 요청 객체에 결과 저장
        } else {
            console.log("이메일 전송 성공:", info.messageId);
            req.emailStatus = "success";
        }
        next(); // 다음 미들웨어 실행
    });
};

module.exports = sendEmailMiddleware;


