// models/ChatRoom.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    room_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    // 기존 space_id -> workspace_id로 명확히 함 (하나의 워크스페이스에 하나의 채팅방)
    workspace_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "chat_rooms",
    timestamps: false,
  }
);

module.exports = ChatRoom;
