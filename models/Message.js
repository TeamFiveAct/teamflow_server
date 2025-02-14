// models/Message.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Message = sequelize.define(
  "Message",
  {
    chat_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (chat_rooms.room_id)
    },
    mem_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (workspace_members.mem_id)
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content_type: {
      type: DataTypes.ENUM("text", "image", "video", "file"),
      allowNull: false,
      defaultValue: "text",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: false,
  }
);

module.exports = Message;
