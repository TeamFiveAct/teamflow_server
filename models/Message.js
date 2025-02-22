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
    // 기존 room_id를 workspace_id로 변경하여 해당 워크스페이스의 채팅방임을 명시
    workspace_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    // 기존 mem_id를 user_id로 변경
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content_type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'file'),
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
