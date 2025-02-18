// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Workspace = require('./Workspace');
const WorkspaceMember = require('./WorkspaceMember');
const ChatRoom = require('./ChatRoom');
const Message = require('./Message');
const Todo = require('./Todo');
const Worker = require('./Worker');
const Tag = require('./Tag');
const TodoTags = require('./TodoTags');
const { fa } = require('@faker-js/faker');

// ─────────────────────────────────────────────────────────
// 1) User ↔ Workspace (1 : 1)
// ─────────────────────────────────────────────────────────
User.hasOne(Workspace, {
  foreignKey: 'user_id',
  as: 'workspaces',
});

Workspace.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'users',
});

// ─────────────────────────────────────────────────────────
// 2) WorkspaceMember ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
WorkspaceMember.belongsTo(Workspace, {
  foreignKey: 'space_id',
  as: 'workspaces',
});
Workspace.hasMany(WorkspaceMember, {
  foreignKey: 'space_id',
  as: 'workspace_member',
});

// ─────────────────────────────────────────────────────────
// 3) ChatRoom ↔ Workspace (1:1)
// ─────────────────────────────────────────────────────────
ChatRoom.belongsTo(Workspace, {
  foreignKey: 'space_id',
  as: 'workspaces',
});
Workspace.hasOne(ChatRoom, {
  foreignKey: 'space_id',
  as: 'chat_rooms',
});

// ─────────────────────────────────────────────────────────
// 4) Message ↔ ChatRoom (N:1)
// ─────────────────────────────────────────────────────────
Message.belongsTo(ChatRoom, {
  foreignKey: 'room_id',
  as: 'ChatRoom',
});
ChatRoom.hasMany(Message, {
  foreignKey: 'room_id',
  as: 'Messages',
});

// ─────────────────────────────────────────────────────────
// 5) Todo ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
Todo.belongsTo(Workspace, {
  foreignKey: 'space_id',
  as: 'Workspace',
});
Workspace.hasMany(Todo, {
  foreignKey: 'space_id',
  as: 'Todos',
});

// ─────────────────────────────────────────────────────────
// 6) Worker ↔ Todo (N:1)
//    하나의 Todo에 여러 명이 참여 가능
// ─────────────────────────────────────────────────────────
Worker.belongsTo(Todo, {
  foreignKey: 'todo_id',
  as: 'Todo',
});
Todo.hasMany(Worker, {
  foreignKey: 'todo_id',
  as: 'Workers',
});

// ─────────────────────────────────────────────────────────
// 7) Tags ↔ TodoTags ↔ Todo (N:M), 중간 테이블 TodoTags
//
// ─────────────────────────────────────────────────────────
Todo.belongsToMany(Tag, {
  through: TodoTags,
  foreignKey: 'todo_id',
  otherKey: 'tag_id',
  as: 'Tags',
});

Tag.belongsToMany(Todo, {
  through: TodoTags,
  foreignKey: 'tag_id',
  otherKey: 'todo_id',
  as: 'Todos',
});

// console.log('DB_NAME:', process.env.DB_NAME);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : 'Not Set');
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_DIALECT:', process.env.DB_DIALECT);

/**
 * 데이터베이스 동기화
 */
// 테이블 만들기 위해서는 true로 하고 테이블 만들면 false로 바꿔주기
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced!');
});

// 모든 모델을 모아서 내보내기
module.exports = {
  User,
  Workspace,
  WorkspaceMember,
  ChatRoom,
  Message,
  Todo,
  Worker,
  Tag,
};
