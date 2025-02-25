// sockets/workspace.js
const { User, WorkspaceMember } = require('../models');

// 워크스페이스별 룸 관리
const workspaceRooms = {};

// 연결된 사용자 정보 관리
const connectedUsers = {};

// 사용자별 접속 관리 (중복 접속 방지)
const userConnections = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Workspace Socket Connected:', socket.id);

    // 워크스페이스 입장
    socket.on('join:workspace', async ({ workspaceId, userId }) => {
      try {
        // 파라미터 검증
        if (!workspaceId || !userId) {
          socket.emit('error', {
            code: 'INVALID_PARAMS',
            message: '워크스페이스 ID와 사용자 ID가 필요합니다.',
            details: { workspaceId, userId }
          });
          return;
        }

        // 이미 접속한 사용자인지 확인
        if (userConnections[userId]) {
          // 같은 워크스페이스에 재접속 시도하는 경우
          if (userConnections[userId].workspaceId === workspaceId) {
            socket.emit('error', {
              code: 'ALREADY_CONNECTED',
              message: '이미 해당 워크스페이스에 접속 중입니다.'
            });
            return;
          }
          
          // 다른 워크스페이스에 접속 중인 경우 기존 연결 강제 종료
          const existingSocket = io.sockets.sockets.get(userConnections[userId].socketId);
          if (existingSocket) {
            existingSocket.disconnect(true);
          }
        }

        // 워크스페이스 멤버 확인
        const member = await WorkspaceMember.findOne({
          where: { user_id: userId, space_id: workspaceId }
        });
        
        if (!member) {
          socket.emit('error', {
            code: 'NOT_MEMBER',
            message: '해당 워크스페이스의 멤버가 아닙니다.',
            details: { workspaceId, userId }
          });
          return;
        }

        // 사용자 정보 조회
        const user = await User.findOne({
          where: { user_id: userId },
          attributes: ['user_id', 'nickname', 'profile_image']
        });

        if (!user) {
          socket.emit('error', {
            code: 'USER_NOT_FOUND',
            message: '사용자 정보를 찾을 수 없습니다.',
            details: { userId }
          });
          return;
        }

        const roomName = `workspace:${workspaceId}`;
        socket.join(roomName);
        console.log(`사용자 ${socket.id}(${user.nickname})가 ${roomName}에 입장`);

        // 새로운 연결 정보 저장
        userConnections[userId] = {
          socketId: socket.id,
          workspaceId
        };
        
        // 워크스페이스 룸 초기화
        if (!workspaceRooms[roomName]) {
          workspaceRooms[roomName] = new Set();
        }
        workspaceRooms[roomName].add(socket.id);

        // 사용자 정보 저장
        const userInfo = {
          userId: user.user_id,
          nickname: user.nickname,
          profileImg: user.profile_image || `https://placehold.co/40x40/gray/white?text=${user.nickname[0]}`
        };
        
        connectedUsers[socket.id] = {
          ...userInfo,
          roomName
        };
        
        // 소켓에 사용자 정보 저장
        socket.userInfo = userInfo;
        
        // 현재 워크스페이스의 모든 사용자 목록을 새로 접속한 사용자에게 전송
        const usersInRoom = Array.from(workspaceRooms[roomName])
          .map(id => connectedUsers[id])
          .filter(user => user && user.roomName === roomName)
          .map(({ userId, nickname, profileImg }) => ({
            userId,
            nickname,
            profileImg
          }));
        
        socket.emit('workspace:users', { users: usersInRoom });
        
        // 다른 사용자들에게 새 사용자 입장 알림
        socket.to(roomName).emit('user:joined', { user: userInfo });
        
        console.log(`${roomName}의 현재 사용자 수: ${workspaceRooms[roomName].size}`);
      } catch (error) {
        console.error('워크스페이스 입장 중 오류:', error);
        socket.emit('error', {
          code: 'JOIN_ERROR',
          message: '워크스페이스 입장 중 오류가 발생했습니다.',
          details: error.message
        });
      }
    });

    // 워크스페이스 퇴장
    socket.on('leave:workspace', ({ workspaceId }) => {
      const roomName = `workspace:${workspaceId}`;
      const userInfo = connectedUsers[socket.id];
      
      socket.leave(roomName);
      console.log(`사용자 ${socket.id}가 ${roomName}에서 퇴장`);
      
      // 워크스페이스 룸에서 사용자 제거
      if (workspaceRooms[roomName]) {
        workspaceRooms[roomName].delete(socket.id);
        
        // 사용자 퇴장을 워크스페이스의 모든 사용자에게 알림
        if (userInfo) {
          io.to(roomName).emit('user:left', { userId: userInfo.userId });
          
          // userConnections에서 제거
          const userId = Object.keys(userConnections).find(
            id => userConnections[id].socketId === socket.id
          );
          if (userId) {
            delete userConnections[userId];
          }
          
          delete connectedUsers[socket.id];
        }
        
        console.log(`${roomName}의 현재 사용자 수: ${workspaceRooms[roomName].size}`);
      }
    });

    // 업무 생성 이벤트 처리 및 브로드캐스트
    socket.on('task:created', (data) => {
      console.log('업무 생성 이벤트 수신:', data);
      const roomName = `workspace:${data.spaceId}`;
      
      // 같은 워크스페이스의 다른 사용자들에게 이벤트 전달
      socket.to(roomName).emit('task:created', data);
      console.log(`${roomName}의 다른 사용자들에게 업무 생성 이벤트 전달`);
    });

    // 업무 업데이트 이벤트 처리 및 브로드캐스트
    socket.on('task:updated', (data) => {
      console.log('업무 업데이트 이벤트 수신:', data);
      const roomName = `workspace:${data.spaceId}`;
      socket.to(roomName).emit('task:updated', data);
    });

    // 업무 상태 변경 이벤트 처리 및 브로드캐스트
    socket.on('task:state_changed', (data) => {
      console.log('업무 상태 변경 이벤트 수신:', data);
      const roomName = `workspace:${data.spaceId}`;
      socket.to(roomName).emit('task:state_changed', data);
    });

    // 업무 삭제 이벤트 처리 및 브로드캐스트
    socket.on('task:deleted', (data) => {
      console.log('업무 삭제 이벤트 수신:', data);
      const roomName = `workspace:${data.spaceId}`;
      socket.to(roomName).emit('task:deleted', data);
    });

    // 연결 종료
    socket.on('disconnect', () => {
      console.log('Workspace Socket Disconnected:', socket.id);
      
      const userInfo = connectedUsers[socket.id];
      if (userInfo) {
        const { roomName } = userInfo;
        
        // 워크스페이스 룸에서 사용자 제거
        if (workspaceRooms[roomName]) {
          workspaceRooms[roomName].delete(socket.id);
          
          // 사용자 퇴장을 워크스페이스의 모든 사용자에게 알림
          io.to(roomName).emit('user:left', { userId: userInfo.userId });
          
          console.log(`${roomName}의 현재 사용자 수: ${workspaceRooms[roomName].size}`);
        }
        
        // userConnections에서도 제거
        const userId = Object.keys(userConnections).find(
          id => userConnections[id].socketId === socket.id
        );
        if (userId) {
          delete userConnections[userId];
        }
        
        delete connectedUsers[socket.id];
      }
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('Workspace Socket 에러:', error);
    });
  });

  // 워크스페이스 소켓 상태 조회 메서드
  io.getWorkspaceStatus = () => {
    const workspaces = {};
    
    // 각 사용자의 워크스페이스 정보 수집
    Object.values(connectedUsers).forEach(user => {
      const { roomName } = user;
      if (!workspaces[roomName]) {
        workspaces[roomName] = [];
      }
      workspaces[roomName].push({
        userId: user.userId,
        nickname: user.nickname,
        profileImg: user.profileImg
      });
    });
    
    return {
      connections: Object.keys(connectedUsers).length,
      workspaces: Object.entries(workspaces).map(([name, users]) => ({
        name,
        users
      }))
    };
  };
};
