const Workspace = require('../models/Workspace');
const workSpaceModel = require('../models/Workspace');
const userModel = require('../models/User');
const workSpaceMemberModel = require('../models/WorkspaceMember');
const nodemailer = require('nodemailer');

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
      user_id: req.body.user_id,
    });

    res.send({
      status: 'SUCCESS',
      message: '워크스페이스 생성 완료되었습니다',
      data: {
        space_password: req.body.space_password,
      },
    });
  } catch (err) {
    res.send({
      status: 'ERROR',
      message: '워크스페이스 생성에 실패하였습니다',
      data: null,
    });
  }
};

// 특정 협업 조회
exports.getSpace = async (req, res) => {
  try {
    const { space_id } = req.params;
    const workSpace = await workSpaceModel.findOne({
      where: {
        space_id: space_id,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: '협업 조회성공',
      data: { ...workSpace.dataValues },
    });
  } catch (err) {
    console.log('getWorkSpace Controller Err:', error);
    res.status(500).json({
      status: 'ERROR',
      message: '협업 조회에 실패하였습니다.',
      data: {},
    });
  }
};

// 개인별(내가가) 참여한 워크스페이스 전체 조회
exports.getMySpace = async (req, res) => {
  try {
    const { user_id } = req.query;
    const workSpaceMeber = await workSpaceMemberModel.findAll({
      where: {
        user_id: user_id,
      },
      attributes: ['space_id'],
    });

    // 참여한 워크스페이스가가 없으면 빈 배열 반환
    if (workSpaceMeber.length === 0) {
      return res.json({
        status: 'SUCCESS',
        message: '참여한한 워크스페이스가 없습니다.',
        data: {},
      });
    }

    // 내가 참여한 space_id 정보를 필터링
    const myspace = workSpaceMeber.map((item) => item.space_id);

    // 내가 속한 space_id 로 전체 워크스페이스 정보 조회
    const myWorkspcae = await workSpaceModel.findAll({
      where: {
        space_id: myspace,
      },
      attributes: ['space_id', 'space_title'],
    });

    res.json({
      status: 'SUCCESS',
      message: '내가 참여한 협업 조회성공',
      data: myWorkspcae,
    });
  } catch (err) {
    console.log('getWorkSpace Controller Err:', error);
    res.status(500).json({
      status: 'ERROR',
      message: '내가 참여한 협업 조회에 실패하였습니다.',
      data: {},
    });
  }
};

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
      },
    });

    // 참여자가 없으면 빈 배열 반환
    if (workSpaceMembers.length === 0) {
      return res.json({
        status: 'SUCCESS',
        message: '해당 워크스페이스에 참여자가 없습니다.',
        data: {},
      });
    }

    const userList = workSpaceMembers.map(
      (member) => member.dataValues.user_id
    );

    /**
     * 전체 사용자 정보 조회
     * {user_id, nickname}
     */
    const members = await userModel.findAll({
      where: {
        user_id: userList,
      },
      attributes: ['user_id', 'nickname'],
    });

    res.json({
      status: 'SUCCESS',
      message: '전체 사용자 조회 성공',
      data: members.map((member) => ({
        space_id,
        ...member.dataValues,
      })),
    });
  } catch (err) {
    console.error('postSpaceMember Controller Err:', err); // 에러 로그 수정

    res.status(500).json({
      status: 'ERROR',
      message: '전체 사용자 조회 실패',
      data: null,
    });
  }
};

// 워크스페이스 방 참여 신청 POST /v1/workspace/join
exports.postSpaceJoin = async (req, res) => {
  try {
    const { space_password } = req.body;
    const userId = req.session.passport?.user?.user_id;

    // 세션에 user_id가 없을 경우
    if (!userId) {
      return res.send({
        status: 'ERROR',
        message: '로그인이 필요합니다.',
      });
    }

    // 워크스페이스 비밀번호가 올바르지 않은 경우
    if (!space_password) {
      return res.send({
        status: 'ERROR',
        message: '비밀번호를 입력해주세요.',
        data: null,
      });
    }

    const findSpace = await workSpaceModel.findOne({
      where: { space_password },
    });

    // 비밀번호에 해당하는 워크스페이스가 없는 경우
    if (!findSpace) {
      return res.send({
        status: 'ERROR',
        message: '워크스페이스 비밀번호가 일치하지 않습니다.',
        data: null,
      });
    }
    const spaceId = findSpace.space_id;
    const existingMember = await workSpaceMemberModel.findOne({
      where: { space_id: spaceId, user_id: userId },
    });

    // 이미 가입되어있을 경우
    if (existingMember) {
      return res.send({
        status: 'ERROR',
        message: '이미 이 워크스페이스의 멤버입니다.',
        data: null,
      });
    }

    // 워크스페이스의 멤버로 가입
    await workSpaceMemberModel.create({
      space_id: spaceId,
      user_id: userId,
    });
    return res.send({
      status: 'SUCCESS',
      message: '워크스페이스에 성공적으로 참여하였습니다.',
      data: null,
    });
  } catch (err) {
    console.log('err', err);
    // 서버 오류 발생시
    return res.send({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};
