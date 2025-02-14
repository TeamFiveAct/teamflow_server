// models/Todo.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Todo = sequelize.define(
  "Todo",
  {
    todo_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    space_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (workspaces.space_id)
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "todos",
    timestamps: false,
  }
);

module.exports = Todo;
