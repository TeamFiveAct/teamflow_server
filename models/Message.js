// models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define(
  'Message',
  {
    chat_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    workspace_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content_type: {
      // 'code' 값 추가
      type: DataTypes.ENUM('text', 'image', 'video', 'file', 'emoji', 'code'),
      allowNull: false,
      defaultValue: 'text',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'messages',
    timestamps: false,
  }
);

module.exports = Message;
