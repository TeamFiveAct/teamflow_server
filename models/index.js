// models/index.js
const User = require("./User");
const Workspace = require("./Workspace");
const WorkspaceMember = require("./WorkspaceMember");
const ChatRoom = require("./ChatRoom");
const Message = require("./Message");
const Todo = require("./Todo");
const Worker = require("./Worker");
const Tag = require("./Tag");

// ─────────────────────────────────────────────────────────
// 1) User ↔ Workspace (Many-to-Many) via WorkspaceMember
// ─────────────────────────────────────────────────────────
User.belongsToMany(Workspace, {
  through: WorkspaceMember,
  foreignKey: "user_id",
  otherKey: "space_id",
  as: "Workspaces",
});

Workspace.belongsToMany(User, {
  through: WorkspaceMember,
  foreignKey: "space_id",
  otherKey: "user_id",
  as: "Users",
});

// ─────────────────────────────────────────────────────────
// 2) User(creator) ↔ Workspace (1:N)
//    Workspace.created_id → User.user_id
// ─────────────────────────────────────────────────────────
Workspace.belongsTo(User, {
  foreignKey: "created_id",
  as: "Creator",
});

// ─────────────────────────────────────────────────────────
// 3) WorkspaceMember ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
WorkspaceMember.belongsTo(Workspace, {
  foreignKey: "space_id",
  as: "Workspace",
});
Workspace.hasMany(WorkspaceMember, {
  foreignKey: "space_id",
  as: "Members",
});

// ─────────────────────────────────────────────────────────
// 4) WorkspaceMember ↔ User (N:1)
// ─────────────────────────────────────────────────────────
WorkspaceMember.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});
User.hasMany(WorkspaceMember, {
  foreignKey: "user_id",
  as: "WorkspaceMembers",
});

// ─────────────────────────────────────────────────────────
// 5) ChatRoom ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
ChatRoom.belongsTo(Workspace, {
  foreignKey: "space_id",
  as: "Workspace",
});
Workspace.hasMany(ChatRoom, {
  foreignKey: "space_id",
  as: "ChatRooms",
});

// ─────────────────────────────────────────────────────────
// 6) Message ↔ ChatRoom (N:1)
// ─────────────────────────────────────────────────────────
Message.belongsTo(ChatRoom, {
  foreignKey: "room_id",
  as: "ChatRoom",
});
ChatRoom.hasMany(Message, {
  foreignKey: "room_id",
  as: "Messages",
});

// ─────────────────────────────────────────────────────────
// 7) Message ↔ WorkspaceMember (N:1)
//    누가 메시지를 보냈는지
// ─────────────────────────────────────────────────────────
Message.belongsTo(WorkspaceMember, {
  foreignKey: "mem_id",
  as: "Sender",
});
WorkspaceMember.hasMany(Message, {
  foreignKey: "mem_id",
  as: "Messages",
});

// ─────────────────────────────────────────────────────────
// 8) Todo ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
Todo.belongsTo(Workspace, {
  foreignKey: "space_id",
  as: "Workspace",
});
Workspace.hasMany(Todo, {
  foreignKey: "space_id",
  as: "Todos",
});

// ─────────────────────────────────────────────────────────
// 9) Worker ↔ Todo (N:1)
//    하나의 Todo에 여러 명이 참여 가능
// ─────────────────────────────────────────────────────────
Worker.belongsTo(Todo, {
  foreignKey: "todo_id",
  as: "Todo",
});
Todo.hasMany(Worker, {
  foreignKey: "todo_id",
  as: "Workers",
});

// ─────────────────────────────────────────────────────────
// 10) Worker ↔ WorkspaceMember (N:1)
// ─────────────────────────────────────────────────────────
Worker.belongsTo(WorkspaceMember, {
  foreignKey: "mem_id",
  as: "Member",
});
WorkspaceMember.hasMany(Worker, {
  foreignKey: "mem_id",
  as: "WorkList", // 예: 그 멤버가 맡은 Todo 리스트
});

// ─────────────────────────────────────────────────────────
// 11) Tag ↔ Workspace (N:1)
// ─────────────────────────────────────────────────────────
Tag.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  as: "Workspace",
});
Workspace.hasMany(Tag, {
  foreignKey: "workspace_id",
  as: "Tags",
});

/**
 * ※ 만약 Tag와 Todo가 다대다 관계라면 todo_tags 같은 별도 중간 테이블을 만들어서
 *   아래와 같이 belongsToMany를 설정하면 됩니다.
 *   ex) Todo.belongsToMany(Tag, { through: 'todo_tags', foreignKey: 'todo_id', otherKey: 'tag_id' });
 *       Tag.belongsToMany(Todo, { through: 'todo_tags', foreignKey: 'tag_id', otherKey: 'todo_id' });
 */

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
