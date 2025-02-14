// config/database.js
require("dotenv").config(); // .env 파일 로드
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // 데이터베이스 이름
  process.env.DB_USER, // 사용자 이름
  process.env.DB_PASSWORD, // 비밀번호
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // SQL 쿼리 로깅 (개발 시 true로 변경 가능)
  }
);

module.exports = sequelize;
