const Workspace = require("../models/Workspace");
const workSpaceModel = require("../models/Workspace");
const workSpaceMemberModel = require("../models/WorkspaceMember");

/*

### **2. 협업 공간 테이블 (`workspace`s)**

| 컬럼명 | 타입 | 설명 | NULL 여부 |
| --- | --- | --- | --- |
| `space_id` | `BIGINT` | 워크스페이스 ID | auto_increment |
| `space_title` | `VARCHAR(255)` | 협업 공간 이름 | NOT NULL |
| `space_description` | `VARCHAR(255)` | 협업 소개 | NULL |
| `space_password` | `VARCHAR(255)` | 협업 공간 비밀번호 | NOT NULL |
| `user_id` | `BIGINT` | 생성한 사용자 ID (FK) | NOT NULL |
| `created_at` | `TIMESTAMP` | 생성 날짜 | 자동생성 |
*/

// 협업 생성
exports.postSpaceCreate = async (req, res) => {
  try {
    const workSpace = await workSpaceModel.create({
      space_title: req.body.space_title,
      space_description: req.body.space_description,
      space_password: req.body.space_password,
      user_id: req.body.user_id
    });

    res.send({
      status: "SUCCESS",
      message: "워크스페이스 생성 완료되었습니다",
      data: {
        space_password: req.body.space_password,
      },
    });
  } catch (err) {
    res.send({
      status: "ERROR",
      message: "워크스페이스 생성에 실패하였습니다",
      data: null,
    });
  }
};

// 특정 협업 조회
exports.getSpace = async (req,res)=>{
  try{
    const { space_id } = req.params;
    const workSpace = await workSpaceModel.findOne({
      where: {
        space_id: space_id,
      }
    })

    res.json({
      status: "SUCCESS",
      message: "협업 조회성공",
      data: {...workSpace.dataValues},
    });
  }catch(err){
    console.log("getWorkSpace Controller Err:", error);
    res.status(500).json({
      status: "ERROR",
      message: "협업 조회에 실패하였습니다.",
      data: {},
    });
  }
}

// 내가 참여한 워크스페이스 전체 조회
exports.getMySpace = async (req,res)=>{
  try{
    const { user_id } = req.body;
    const workSpace = await workSpaceModel.findAll({
      where: {
        user_id: user_id,
      }
    })

    res.json({
      status: "SUCCESS",
      message: "내가 참여한 협업 조회성공",
      data: {...workSpace.dataValues},
    });
  }catch(err){
    console.log("getWorkSpace Controller Err:", error);
    res.status(500).json({
      status: "ERROR",
      message: "내가 참여한 협업 조회에 실패하였습니다.",
      data: {},
    });
  }
}


// 특정 워크스페이스에 참여한 참여자 전체조회
exports.postSpaceMember = async(req,res)=>{
  try{
    const { space_id } = req.body;
    const workSpaceMember = await workSpaceMemberModel.findAll({
      where: {
        space_id: space_id,
      }
    })

    const workSpace = await workSpaceModel.findAll({
      where: {
        space_id: space_id,
      }
    })

    // console.log("workspacemember",workSpaceMember);
    console.log("workspace",workSpace);

    res.json({
      status: "SUCCESS",
      message: `${space_id}협업 참여자 조회완료`,
      data: {
        // space_title: workSpace.dataValues.space_title,
      },
    });


  }catch(err){
    console.log("getWorkSpace Controller Err:", error);
    res.status(500).json({
      status: "ERROR",
      message: "내가 참여한 협업 조회에 실패하였습니다.",
      data: {},
    });
  }
}

exports.index = async (req,res)=>{
  
}