// sockets/index.js

const chatSocket = require('./chat');
const workspaceSocket = require('./workspace');

module.exports = (io) => {
  // CORS 및 기타 설정은 app.js에서 처리됨
  
  // 채팅 소켓 초기화
  chatSocket(io);
  
  // 워크스페이스 소켓 초기화
  workspaceSocket(io);
  
  // 전체 소켓 상태 조회 API
  io.getStatus = () => {
    return {
      status: 'online',
      workspace: io.getWorkspaceStatus(),
    };
  };
};
