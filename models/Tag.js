// models/Tag.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Tag = sequelize.define(
  "Tag",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    workspace_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (workspaces.space_id)
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_global: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "tags",
    timestamps: false,
  }
);

module.exports = Tag;
