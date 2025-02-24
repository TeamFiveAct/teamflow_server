const todoModel = require("../models/Todo");
const workerModel = require("../models/Worker");
const workSpaceMemberModel = require("../models/WorkspaceMember");
const responseUtil = require('../utils/ResponseUtil');

// 전체 업무 리스트
exports.postTodoList = async (req, res) => {
  try {
    const spaceId = req.params.space_id;
    const limit = 5;// 기본값 지정
    const statuses = ["plan", "progress", "done"];// 가져올 칸반보드 상태 목록

    // 각 상태별로 5개씩 가져오기
    const todoPromises = await Promise.all(
      statuses.map((status) =>
        todoModel.findAll({
          where: {
            space_id: spaceId,
            status: status, // 상태별 필터링
            is_deleted: false,
          },
          order: [["created_at", "ASC"]], // 생성일 기준 정렬
          limit: limit,
        })
      )
    );
    
    // 업무가 존재하지 않을경우
    if (!todoPromises || todoPromises.length === 0 || todoPromises.every(todos => todos.length === 0)) {
      return res.send(responseUtil('SUCCESS', '조회할 업무가 없습니다.', null));
    }
    
    // 병렬로 모든 상태 데이터 가져오기
    const results = await Promise.all(todoPromises);

    console.log(results);

    // 업무 데이터 3단계 가공
    const todoList = {};
    statuses.forEach((status, index) => {
      todoList[status] = results[index].map((todo) => todo.dataValues);
    });
    res.send(responseUtil('SUCCESS', '전체업무 목록을 가져왔습니다.', todoList));
  } catch (error) {
    console.log('postTodoList Controller Err:', error);
    res.send(responseUtil('ERROR', '전체 업무조회에 실패하였습니다.', null));
  }
};

// 특정 상태의 업무 리스트 조회
exports.postTodoStateList = async (req,res)=>{
  try{
      const { state, limit, offset } = req.body;
      
      // 조회 기본값 설정
      const taskLimit = parseInt(limit) || 5;
      const taskOffset = parseInt(offset) || 0;
      const tasks = await todoModel.findAll({
        where: { status:state }, // 상태 필터링
        order: [["created_at", "ASC"]], // 생성일 기준 정렬
        limit: taskLimit, // 개수 제한
        offset: taskOffset // 시작 위치 설정
      });
    res.send(responseUtil('SUCCESS', '전체업무 목록을 가져왔습니다.', tasks));
  }catch(error){
    console.log('postTodoStateList Controller Err:', error);
    res.send(responseUtil('ERROR', '전체 업무조회에 실패하였습니다.', null));
  }
}

// 특정 업무 조회
exports.postTodo = async (req, res) => {
  try {
    const { space_id, todo_id } = req.params;
    const todo = await todoModel.findOne({
      where: {
        space_id: space_id,
        todo_id: todo_id,
      },
    });
    res.send(
      responseUtil('SUCCESS', '특정업무 조회성공에 성공했습니다.', {
        ...todo.dataValues,
      })
    );
  } catch (error) {
    console.log('postTodo Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 조회에 실패하였습니다.', null));
  }
};

// 업무 생성
exports.postTodoCreate = async (req, res) => {
  try {
    // 업무 생성
    const todo = await todoModel.create({
      space_id: req.params.space_id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      start_date: req.body.start_date,
      due_date: req.body.due_date,
    });


    // 해당 워크스페이스 멤버 조회
    const spaceMember = await workSpaceMemberModel.findOne({
      where:{
        space_id: req.params.space_id,
        user_id: req.session.passport?.user?.user_id
      }
    })

    // 업무 참여자 생성
    const worker = await workerModel.create({
      todo_id: todo.todo_id,
      mem_id: spaceMember.mem_id
    });


    res.send(responseUtil('SUCCESS', '업무생성 성공했습니다.', null));
  } catch (error) {
    console.log('postTodoCreate Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 생성에 실패하였습니다.', null));
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
      return res.send(
        responseUtil('ERROR', '해당 업무를 찾을 수 없습니다.', null)
      );
    }

    // 업무 데이터 업데이트
    // body 로 들어온 값만 update 됨 (기존 조회했던 데이터 기준으로 수정)
    await todo.update(updateData);
    res.send(responseUtil('SUCCESS', '업무 수정 성공했습니다.', todo));
  } catch (error) {
    console.log('patchTodo Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 수정에 실패하였습니다.', null));
  }
};

//업무 삭제 (소프트딜리트적용)
exports.deleteTodo = async (req, res) => {
  try {
    const { todo_id, space_id } = req.params;
    const user_id = req.session.passport?.user?.user_id;
    // 삭제 전 삭제할 데이터가 존재하는지 확인인
    const todo = await todoModel.findByPk(todo_id);

    if (!todo) {
      return res.status(404).send({
        status: "ERROR",
        message: "해당 업무를 찾을 수 없습니다.",
        data: null,
      });
    }

    // // 삭제할 업무 작성자 조회
    // const todo_writer = await workerModel.findOne({
    //   where:{todo_id: todo_id}
    // });

    // // 해당 협업 참여자 조회
    // const spaceMember = await workSpaceMemberModel.findOne({
    //   where:{
    //     space_id: space_id,
    //     user_id: user_id
    //   }
    // })

    // // 업무 참여자도 소프트 삭제 (휴지통)
    // const softDelWork = await workerModel.update(
    //   { is_deleted: true, deleted_at: new Date().toISOString().slice(0, 19).replace("T", " ") },
    //   { where: { todo_id: todo_id, mem_id: todo_writer.mem_id } }
    // );

    // 업무 소프트 삭제
    const softDelTodo = await todo.update(
      { is_deleted: true, deleted_at: new Date().toISOString().slice(0, 19).replace("T", " ") },
      { where: { space_id: space_id, todo_id: todo_id  } }
    );

    res.send(responseUtil('SUCCESS', '업무가 소프트 삭제되었습니다.', null));
  } catch (error) {
    console.log('patchTodo Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 삭제에 실패하였습니다.', null));
  }
};

//소프트 삭제된 업무 리스트
exports.postSoftDelList = async (req, res) => {
  try{
    const {space_id } = req.params;
    const user_id = req.session.passport?.user?.user_id;
    // 삭제 전 삭제할 데이터가 존재하는지 확인인
    const todo = await todoModel.findAll({
      where:{
        space_id:space_id,
        user_id:user_id
      }
    });
    res.send(responseUtil('SUCCESS', '업무가 성공적으로 불러왔습니다', null));
  }catch(error){
    console.log('postSoftDelList Controller Err:', error);
    res.send(responseUtil('ERROR', '삭제한 업무 리스트를 불러오는데 실패했습니다', null));
  }
};

// 업무 하드 삭제 (완전히 DB에서 제거)
exports.deleteHardDeleteTodo = async (req, res) => {
  try {
    const { todo_id, space_id } = req.params;
    const user_id = req.session.passport?.user?.user_id;

    // 삭제할 todo 확인
    const todo = await todoModel.findOne({
      where:{
        space_id: space_id,
        todo_id: todo_id,
        is_deleted: true
      }
    });

    if (!todo) {
      return res.status(404).send({
        status: "ERROR",
        message: "삭제된 업무가 존재하지않습니다",
        data: null,
      });
    }

  //  // 해당 협업 참여자 조회
  //  const spaceMember = await workSpaceMemberModel.findOne({
  //   where:{
  //     space_id: space_id,
  //     user_id: user_id
  //   }
  // });

  //   // 삭제할 업무 작성자 조회
  //   const todo_writer = await workerModel.findOne({
  //     where:{todo_id: todo_id, mem_id:spaceMember.mem_id}
  //   });

  //   // 먼저 연관된 데이터(예: workerModel) 삭제
  //   await workerModel.destroy({
  //     where: {
  //      todo_id: todo_id, mem_id: todo_writer.mem_id 
  //     } 
  //   });

    // 실제 업무 데이터 삭제
    await todo.destroy();

    res.send(responseUtil('SUCCESS', '업무가 삭제되었습니다.', null));
  } catch (error) {
    console.log('deleteHardDeleteTodo Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 삭제에 실패하였습니다.', null));
  }
};

// 업무 삭제 복구
exports.restoreTodo = async (req, res) => {
  try {
    const { todo_id, space_id } = req.params;

    // 소프트 삭제된 todo 찾기
    const todo = await todoModel.findOne({
      where: { space_id:space_id, todo_id: todo_id, is_deleted: true },
    });

    // 복구할 todo가 존재하지 않을경우
    if (!todo) {
      return res.send(responseUtil('ERROR', '삭제된 업무를 찾을 수 없습니다.', null))
    }

    // // 소프트 삭제된 업무 작성자 조회
    // const todo_writer = await workerModel.findOne({
    //   where:{todo_id: todo_id}
    // });
    
    // // 삭제된 Worker들도 복구
    // await workerModel.update(
    //   { is_deleted: false, deleted_at: null },
    //   { where: { todo_id: todo_id, mem_id:todo_writer.mem_id } }
    // );

    // 업무 복구
    await todo.update({ is_deleted: false, deleted_at: null });

    res.send(responseUtil('SUCCESS', '업무가 복구되었습니다.', null));
  } catch (error) {
    console.log('restoreTodo Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 복구에 실패하였습니다.', null));
  }
};

// 업무 상태수정
exports.patchTodoState = async (req, res) => {
  try {
    const { todo_id } = req.params;
    const { state } = req.body; // 변경할 상태 값

    // 해당 업무 찾기
    const todo = await todoModel.findByPk(todo_id);
    if (!todo) {
      return res.send(responseUtil('ERROR', '수정할 업무를 찾을 수 없습니다.', null));
    }

    // 상태 업데이트
    await todo.update({ state });
    res.send(responseUtil('SUCCESS', '업무 상태가 변경되었습니다.', {id: todo.id,state: todo.state,}));
  } catch (error) {
    console.log('patchTodoState Controller Err:', error);
    res.send(responseUtil('ERROR', '업무 상태 변경에 실패하였습니다.', null));
  }
};