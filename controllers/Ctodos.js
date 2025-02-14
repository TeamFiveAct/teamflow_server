
const todoModel = require("../models/Todo");
// const { errorlogs } = require("../utils/common");

// 전체 업무 리스트
exports.postTodoList = async (req, res) => {
  try {
    const todos = await todoModel.findAll();
    const allTodo = todos.map((todo) => todo.dataValues);

    res.json({
      status: "SUCCESS",
      message: "전체 업무 조회성공",
      data: allTodo,
    });
  } catch (error) {
    console.log("getTodoItem Controller Err:", error);
    res.status(500).json({
      status: "ERROR",
      message: "전체 업무조회에 실패하였습니다.",
      data: {},
    });
  }
};

// 특정 업무 조회
exports.postTodo = async (req, res) => {
  try {
    const todo = await todoModel.findOne({
      where: { todo_id: req.params.todo_id, space_id: req.body.space_id },
    });

    res.json({
      status: "SUCCESS",
      message: "특정업무 조회성공",
      data: { ...todo.dataValues },
    });
  } catch (error) {
    console.log("getTodoItem Controller Err:", error);
    res.status(500).json({
      status: "ERROR",
      message: "업무 조회에 실패하였습니다.",
      data: {},
    });
  }
};

// 업무 생성
exports.postTodoCreate = async (req, res) => {
  try {
    const todo = await todoModel.create({
      space_id: req.body.space_id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      start_date: req.body.start_date,
      due_date: req.body.due_date,
    });

    res.send({
      status: "SUCCESS",
      message: "업무생성 성공",
      data: null,
    });
  } catch (err) {
    res.send({
      status: "ERROR",
      message: "업무 생성에 실패하였습니다.",
      data: null,
    });
  }

  // todoModel
  //   .create({
  //     space_id: req.body.space_id,
  //     title: req.body.title,
  //     description: req.body.description,
  //     priority: req.body.priority,
  //     start_date: req.body.start_date,
  //     due_date: req.body.due_date,
  //   })
  //   .then((res) => {
  //     res.send({
  //       status: "SUCCESS",
  //       message: "업무생성 성공",
  //       data: null,
  //     });
  //   })
  //   .catch((err) => {
  //     res.send({
  //       status: "ERROR",
  //       message: "업무 생성에 실패하였습니다.",
  //       data: null,
  //     });
  //   });
};

exports.updateTodo = (req, res) => {};

exports.deleteTodo = (req, res) => {};

exports.patchTodoState = (req, res) => {};

