// models/WorkspaceMember.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const WorkspaceMember = sequelize.define(
  "WorkspaceMember",
  {
    mem_id: {
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
      allowNull: false, // FK (users.user_id)
    },
  },
  {
    tableName: "workspace_members",
    timestamps: false,
  }
);

module.exports = WorkspaceMember;
