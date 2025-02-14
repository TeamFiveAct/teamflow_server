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
    /**
     * tag_id를 배열로 저장한다고 했지만, MySQL에서는 ENUM/SET/JSON 등을 활용해야 합니다.
     * 다대다 관계로 연결하는 경우에는 별도 중간 테이블(todo_tags) 등을 사용합니다.
     * 아래 예시는 JSON으로 간단히 저장하는 경우 예시
     */
    // tag_ids: {
    //   type: DataTypes.JSON, // 혹은 TEXT로 하고 GET/SET을 통해 JSON 파싱
    //   allowNull: true,
    // },
  },
  {
    tableName: "todos",
    timestamps: false,
  }
);

module.exports = Todo;
