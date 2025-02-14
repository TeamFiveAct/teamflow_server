// models/Workspace.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Workspace = sequelize.define(
  "Workspace",
  {
    space_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    space_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    space_password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (users.user_id)
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "workspaces",
    timestamps: false,
  }
);

module.exports = Workspace;
