// models/Worker.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // 경로 수정

const Worker = sequelize.define(
  "Worker",
  {
    worker_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    todo_id: {
      type: DataTypes.BIGINT,
      allowNull: false, // FK (todos.todo_id)
    },
    mem_id: {
      type: DataTypes.BIGINT,
      allowNull: true, // FK (workspace_members.mem_id)
    },
  },
  {
    tableName: "worker", // 혹은 'workers'
    timestamps: false,
  }
);

module.exports = Worker;
