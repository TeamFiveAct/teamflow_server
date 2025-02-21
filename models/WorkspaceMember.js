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
    //소프트 딜리트 관련
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "workspace_member",
    timestamps: false,
    paranoid: true,
  }
);

module.exports = WorkspaceMember;
