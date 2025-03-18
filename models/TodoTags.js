//models\TodoTags.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Todo = require('./Todo');
const Tag = require('./Tag');

const TodoTag = sequelize.define(
  'TodoTag',
  {
    todo_id: {
      type: DataTypes.INTEGER,
      references: { model: Todo, key: 'todo_id' },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    tag_id: {
      type: DataTypes.INTEGER,
      references: { model: Tag, key: 'tag_id' },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
  },
  {
    tableName: 'TodoTags',
    timestamps: false,
  }
);
module.exports = TodoTag;
