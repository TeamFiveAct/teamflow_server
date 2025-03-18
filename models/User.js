// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 경로 수정

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    auth_provider: {
      type: DataTypes.ENUM('email', 'kakao'),
      allowNull: false,
      defaultValue: 'email',
    },
    kakao_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    access_token: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'users',
    timestamps: false, // created_at 등을 직접 다룬다면 true일 필요가 없을 수 있습니다.
    paranoid: true,
  }
);

module.exports = User;
