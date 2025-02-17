
const todoModel = require("../models/Todo");
// const { errorlogs } = require("../utils/common");

// 전체 업무 리스트
exports.postTodoList = async (req, res) => {
  try {
    console.log(req.params);
    const todos = await todoModel.findAll({
      where: {
        space_id: req.params.space_id,
      }
    });
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
    console.log(req.params);
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
};

// 업무 수정
exports.patchTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const updateData = req.body; // 수정할 데이터 가져오기

    // 해당 업무 찾기
    const todo = await todoModel.findByPk(todo_id);
    if (!todo) {
      return res.status(404).send({
        status: "ERROR",
        message: "해당 업무를 찾을 수 없습니다.",
        data: null,
      });
    }

    // 업무 데이터 업데이트 
    // body 로 들어온 값만 update 됨 (기존 조회했던 데이터 기준으로 수정)
    await todo.update(updateData);

    res.send({
      status: "SUCCESS",
      message: "업무 수정 성공",
      data: todo, // 수정된 데이터 반환
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: "ERROR",
      message: "업무 수정에 실패하였습니다.",
      data: null,
    });
  }
};

// 업무 삭제
exports.deleteTodo = async (req, res) => {
  try {
    const { todo_id } = req.params;

    // 삭제 전 삭제할 데이터가 존재하는지 확인인
    const todo = await todoModel.findByPk(todo_id);
    if (!todo) {
      return res.status(404).send({
        status: "ERROR",
        message: "해당 업무를 찾을 수 없습니다.",
        data: null,
      });
    }

    // 해당 데이터 삭제 (기존 조회했던 데이터 기준으로 삭제)
    await todo.destroy();

    res.send({
      status: "SUCCESS",
      message: "업무 삭제 성공",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: "ERROR",
      message: "업무 삭제에 실패하였습니다.",
      data: null,
    });
  }
};

// 업무 상태수정
exports.patchTodoState = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { state } = req.body; // 변경할 상태 값

    // 1️⃣ 해당 업무 찾기
    const todo = await todoModel.findByPk(todo_id);
    if (!todo) {
      return res.status(404).send({
        status: "ERROR",
        message: "해당 업무를 찾을 수 없습니다.",
        data: null,
      });
    }

    // 2️⃣ 상태 업데이트
    await todo.update({ state });

    res.send({
      status: "SUCCESS",
      message: "업무 상태가 변경되었습니다.",
      data: { id: todo.id, state: todo.state },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: "ERROR",
      message: "업무 상태 변경에 실패하였습니다.",
      data: null,
    });
  }
};

