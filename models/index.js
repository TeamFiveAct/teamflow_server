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
const PasswordReset = require('./PasswordReset'); // PasswordReset 모델 연결

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
  onDelete: 'CASCADE',
});

// ─────────────────────────────────────────────────────────
// 2) WorkspaceMember ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
WorkspaceMember.belongsTo(Workspace, {
  foreignKey: 'space_id',
  as: 'workspaces',
  onDelete: 'CASCADE',
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
  onDelete: 'CASCADE',
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
  onDelete: 'CASCADE',
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
  onDelete: 'CASCADE',
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
  onDelete: 'CASCADE',
});
Todo.hasMany(Worker, {
  foreignKey: 'todo_id',
  as: 'Workers',
});

// ─────────────────────────────────────────────────────────
// 7) Tags ↔ TodoTags ↔ Todo (N:M), 중간 테이블 TodoTags
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
  onDelete: 'CASCADE',
});

Message.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
});
User.hasMany(Message, {
  foreignKey: 'user_id',
  as: 'messages',
});
// ─────────────────────────────────────────────────────────
// 8) PasswordReset ↔ User (N:1)
// ─────────────────────────────────────────────────────────
// PasswordReset 모델에서 associate 메서드를 사용해 관계를 설정할 수도 있음
// 아래와 같이 직접 설정해줄 수 있습니다.
PasswordReset.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
});

// 데이터베이스 동기화
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
  PasswordReset,
};
