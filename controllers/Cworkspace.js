const Workspace = require("../models/Workspace");
const workSpaceModel = require("../models/Workspace");
const userModel = require('../models/User');
const workSpaceMemberModel = require("../models/WorkspaceMember");
const sendEmailMiddleware = require('../middlewares/emailMiddleware'); // 이메일 미들웨어
const nodemailer = require("nodemailer");
const env = 'localDev';
const config = require(__dirname + '/../config/config.json')[env];

/*
1. 워크스페이스 생성
2. 워크스페이스 조회
3. 특정 워크스페이스 조회
4. 개인별(나의) 워크 스페이스 조회회
5. 특정 워크스페이스의 참여한 참여자 조회
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

// 개인별(내가가) 참여한 워크스페이스 전체 조회
exports.getMySpace = async (req,res)=>{
  try{
    const { user_id } = req.query;
    const workSpaceMeber = await workSpaceMemberModel.findAll({
      where: {
        user_id: user_id,
      },
      attributes: ['space_id']
    })

    // 참여한 워크스페이스가가 없으면 빈 배열 반환
    if (workSpaceMeber.length === 0) {
      return res.json({
        status: "SUCCESS",
        message: "참여한한 워크스페이스가 없습니다.",
        data: {},
      });
    }

    // 내가 참여한 space_id 정보를 필터링
    const myspace = workSpaceMeber.map( item => item.space_id)
    
    // 내가 속한 space_id 로 전체 워크스페이스 정보 조회
    const myWorkspcae = await workSpaceModel.findAll({
      where: {
        space_id: myspace,
      },
      attributes: ['space_id', 'space_title']
    })

    res.json({
      status: "SUCCESS",
      message: "내가 참여한 협업 조회성공",
      data: myWorkspcae
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

// 특정 워크스페이스에 참여한 참여자 전체 조회
exports.postSpaceMember = async (req, res) => {

  // 로그인체크
  if (!req.isAuthenticated()) {
    return res.json({
      status: 'ERROR',
      message: '로그인이 필요합니다.',
      data: null,
    });
  }

  try {
    const { space_id } = req.params;

    /**
     * 특정 협업에 속한 참여자 정보 조회
     * {mem_id, space_id, user_id}
     */
    const workSpaceMembers = await workSpaceMemberModel.findAll({
      where: {
        space_id: space_id,
      }
    });

    // 참여자가 없으면 빈 배열 반환
    if (workSpaceMembers.length === 0) {
      return res.json({
        status: "SUCCESS",
        message: "해당 워크스페이스에 참여자가 없습니다.",
        data: {},
      });
    }


    const userList = workSpaceMembers.map(member => member.dataValues.user_id);

    /**
     * 전체 사용자 정보 조회
     * {user_id, nickname}
     */
    const members = await userModel.findAll({
      where: {
        user_id: userList
      },
      attributes: ['user_id', 'nickname']
    });

    res.json({
      status: "SUCCESS",
      message: "전체 사용자 조회 성공",
      data: members.map(member => ({
        space_id,
        ...member.dataValues
      })),
    });

  } catch (err) {
    console.error("postSpaceMember Controller Err:", err); // 에러 로그 수정

    res.status(500).json({
      status: "ERROR",
      message: "전체 사용자 조회 실패",
      data: null
    });
  }
};

// 워크스페이스 참여
exports.postSpaceJoin = async (req,res)=>{

  // 로그인체크
    if (!req.isAuthenticated()) {
    return res.json({
      status: 'ERROR',
      message: '로그인이 필요합니다.',
      data: null,
    });
  }

  res.send({});
}


// 이메일 발송을 위한 Nodemailer 설정
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "revecloud7@gmail.com",
    pass: config.emailPass,
  },
});
// 협업초대 메일발송
exports.postSpaceInvite = async (req, res, next) => {
    try {
        const { email, space_id } = req.body;

        if (!email || !space_id) {
            return res.status(400).json({ error: "이메일과 워크스페이스 ID가 필요합니다." });
        }

        // 예제 초대 코드 (실제 서비스에서는 DB에서 가져오거나 생성해야 함)
        const inviteCode = "ABC123";

        // 이메일 발송 내용을 req.body에 추가하여 미들웨어에서 사용함!
        req.body.subject = "TeamFlow - 워크스페이스에 초대되었습니다!";
        req.body.to = email;
        req.body.text = `워크스페이스에 초대되었습니다. 초대 코드: ${inviteCode}`;
        req.body.html = `<p>워크스페이스에 초대되었습니다.</p><p>초대 코드: <b>${inviteCode}</b></p>`;

        // 이메일 미들웨어 실행
        sendEmailMiddleware(req, res, () => {
            res.status(200).json({
                message: "초대 이메일이 전송되었습니다.",
                emailStatus: req.emailStatus,
            });
        });
    } catch (error) {
        console.error("초대 이메일 전송 오류:", error);
        res.status(500).json({ error: "초대 이메일 전송 중 오류가 발생했습니다." });
    }
};
