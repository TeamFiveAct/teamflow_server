// models/ChatRoom.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    room_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    space_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (workspaces.space_id)
    },
    user_id: {
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
