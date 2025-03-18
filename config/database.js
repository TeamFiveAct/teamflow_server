const { Sequelize } = require('sequelize');
// const env = process.env.NODE_ENV || 'development';
//const env = 'production';
const env = 'localDev';
const config = require(__dirname + '/../config/config.json')[env];

const sequelize = new Sequelize(
  config.database, // 데이터베이스 이름
  config.username, // 사용자 이름
  config.password, // 비밀번호
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false, // SQL 쿼리 로깅 (개발 시 true로 변경 가능)
  }
);

module.exports = sequelize;
