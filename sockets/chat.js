module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket Connected:', socket.id);

    // 채팅방 입장
    socket.on('joinRoom', ({ mem_id, room_id }) => {
      socket.join(room_id);
      console.log(`mem_id=${mem_id} 님이 room_id=${room_id}에 입장`);
    });

    // 메시지 전송 (브로드캐스트)
    socket.on(
      'sendMessage',
      ({ mem_id, room_id, content, content_type = 'text' }) => {
        const messageObj = {
          mem_id,
          room_id,
          content,
          content_type,
          created_at: new Date(),
        };
        io.to(room_id).emit('receiveMessage', messageObj);
      }
    );

    // 방 나가기
    socket.on('leaveRoom', ({ room_id }) => {
      socket.leave(room_id);
      console.log(`Socket ${socket.id} 님이 room_id=${room_id}에서 퇴장`);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Socket Disconnected:', socket.id);
    });
  });
};
