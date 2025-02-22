// models/Worker.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 경로 수정

const Worker = sequelize.define(
  'Worker',
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
    //소프트 딜리트 관련
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'worker', // 혹은 'workers'
    paranoid: true, // 소프트 딜리트 활성화
    timestamps: false,
  }
);

module.exports = Worker;
