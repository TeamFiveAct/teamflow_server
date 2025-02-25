const { Message, ChatRoom, WorkspaceMember, User } = require('../models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket Connected:', socket.id);

    // 채팅방 입장 – user_id와 workspace_id를 이용하여 그룹 채팅방에 입장
    socket.on('joinRoom', async ({ user_id, workspace_id }) => {
      // 워크스페이스 멤버 여부 확인
      try {
        const member = await WorkspaceMember.findOne({
          where: { user_id, space_id: workspace_id }
        });
        if (!member) {
          socket.emit('error', '해당 workspace의 멤버가 아닙니다.');
          return;
        }
      } catch (err) {
        console.error('멤버 확인 중 오류:', err);
        socket.emit('error', '멤버 확인 중 오류가 발생했습니다.');
        return;
      }

      // 해당 workspace에 대응하는 채팅방이 존재하는지 확인
      try {
        const chatRoom = await ChatRoom.findOne({ where: { workspace_id } });
        if (!chatRoom) {
          socket.emit('error', '해당 workspace에 대한 채팅방이 존재하지 않습니다.');
          return;
        }
      } catch (err) {
        console.error('채팅방 확인 중 오류:', err);
        socket.emit('error', '채팅방 확인 중 오류가 발생했습니다.');
        return;
      }

      // workspace_id를 문자열로 변환하여 room 식별자로 사용
      socket.join(workspace_id.toString());
      console.log(`user_id=${user_id} 님이 workspace_id=${workspace_id} 채팅방에 입장`);

      // 과거 채팅 기록 불러오기 (생성순 ASC) – 사용자 닉네임과 프로필 이미지 포함
      try {
        const messages = await Message.findAll({
          where: { workspace_id },
          order: [['created_at', 'ASC']],
          include: [{
            model: User,
            as: 'user',
            attributes: ['nickname', 'profile_image']
          }]
        });
        socket.emit('chatHistory', messages);
      } catch (error) {
        console.error('채팅 기록 로딩 중 오류:', error);
      }
    });

    // 메시지 전송 (브로드캐스트) – user_id와 workspace_id를 이용
    socket.on('sendMessage', async ({ user_id, workspace_id, content, content_type = 'text' }) => {
      const messageObj = {
        user_id,
        workspace_id,
        content,
        content_type,
        created_at: new Date(),
      };
      try {
        // 메시지를 DB에 저장
        const savedMessage = await Message.create(messageObj);
        
        // 저장된 메시지를 사용자 정보와 함께 다시 조회
        const messageWithUser = await Message.findOne({
          where: { chat_id: savedMessage.chat_id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['nickname', 'profile_image']
          }]
        });
        
        // 해당 워크스페이스의 채팅방에 메시지 브로드캐스트
        io.to(workspace_id.toString()).emit('receiveMessage', messageWithUser);
      } catch (error) {
        console.error('메시지 전송 중 오류:', error);
      }
    });

    // 채팅방 퇴장
    socket.on('leaveRoom', ({ workspace_id }) => {
      socket.leave(workspace_id.toString());
      console.log(`Socket ${socket.id} 님이 workspace_id=${workspace_id} 채팅방에서 퇴장`);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Socket Disconnected:', socket.id);
    });
  });
};
