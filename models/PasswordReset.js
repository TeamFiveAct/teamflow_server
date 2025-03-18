// models/PasswordReset.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordReset = sequelize.define(
  'PasswordReset',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true, // 여기서 인덱스 생성됨
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'password_resets',
    timestamps: false,
    // indexes 옵션에서 token 인덱스 제거
    indexes: [
      // user_id 인덱스도 MySQL이 자동 생성할 수 있으므로 제거하거나 주석 처리합니다.
      // { fields: ['user_id'] },
    ],
  }
);

PasswordReset.associate = (models) => {
  PasswordReset.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = PasswordReset;
