// models/Tag.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Tag = sequelize.define(
  "Tag",
  {
    tag_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tag_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "tags",
    timestamps: false,
  }
);

module.exports = Tag;
