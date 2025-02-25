// public/socket-example.js

/**
 * 워크스페이스 소켓 연결 예제 코드
 * 
 * 사용 방법:
 * 1. 먼저 사용자 로그인이 되어있어야 합니다.
 * 2. connectToWorkspace 함수를 호출하여 워크스페이스에 연결합니다.
 * 3. 이벤트 핸들러를 등록하여 실시간 업데이트를 처리합니다.
 */

// 소켓 연결 및 워크스페이스 입장
async function connectToWorkspace(workspaceId) {
  try {
    // 1. 현재 로그인된 사용자 정보 조회
    const response = await fetch('/v1/user/info', {
      credentials: 'include'  // 중요: 쿠키를 포함하여 요청
    });
    
    const result = await response.json();
    if (result.status !== 'SUCCESS') {
      throw new Error('사용자 정보를 가져올 수 없습니다');
    }

    const userId = result.data.user_id;

    // 2. 소켓 연결
    const socket = io('http://localhost:8000', {
      withCredentials: true
    });

    // 3. 연결 성공 시 워크스페이스 입장
    socket.on('connect', () => {
      console.log('소켓 연결 성공');
      
      // 워크스페이스 입장
      socket.emit('join:workspace', {
        workspaceId,
        userId
      });
    });

    // 4. 이벤트 핸들러 등록
    
    // 현재 접속자 목록 수신
    socket.on('users:list', (users) => {
      console.log('현재 접속자 목록:', users);
      // UI 업데이트 로직 구현
      updateUsersList(users);
    });

    // 새로운 사용자 입장
    socket.on('users:joined', (user) => {
      console.log('새로운 사용자 입장:', user);
      // UI 업데이트 로직 구현
      addUserToList(user);
    });

    // 사용자 퇴장
    socket.on('users:left', (user) => {
      console.log('사용자 퇴장:', user);
      // UI 업데이트 로직 구현
      removeUserFromList(user);
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('소켓 에러:', error);
      switch (error.code) {
        case 'INVALID_PARAMS':
          alert('워크스페이스 접속에 필요한 정보가 누락되었습니다.');
          break;
        case 'NOT_MEMBER':
          alert('해당 워크스페이스의 멤버가 아닙니다.');
          break;
        case 'USER_NOT_FOUND':
          alert('사용자 정보를 찾을 수 없습니다.');
          window.location.href = '/login';  // 로그인 페이지로 리다이렉트
          break;
        default:
          alert('워크스페이스 접속 중 오류가 발생했습니다.');
      }
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('소켓 연결이 종료되었습니다.');
    });

    // 5. 워크스페이스 퇴장 함수
    function leaveWorkspace() {
      socket.emit('leave:workspace', { workspaceId });
    }

    return {
      socket,
      leaveWorkspace
    };

  } catch (error) {
    console.error('워크스페이스 연결 실패:', error);
    alert('워크스페이스 연결에 실패했습니다.');
    throw error;
  }
}

// UI 업데이트 함수 예시 (실제 구현 필요)
function updateUsersList(users) {
  // 접속자 목록 UI 업데이트
  const usersList = document.getElementById('users-list');
  if (usersList) {
    usersList.innerHTML = users.map(user => `
      <div class="user-item" data-user-id="${user.user_id}">
        <img src="${user.profile_image}" alt="${user.nickname}" />
        <span>${user.nickname}</span>
      </div>
    `).join('');
  }
}

function addUserToList(user) {
  // 새로운 사용자 UI 추가
  const usersList = document.getElementById('users-list');
  if (usersList) {
    const userElement = document.createElement('div');
    userElement.className = 'user-item';
    userElement.dataset.userId = user.user_id;
    userElement.innerHTML = `
      <img src="${user.profile_image}" alt="${user.nickname}" />
      <span>${user.nickname}</span>
    `;
    usersList.appendChild(userElement);
  }
}

function removeUserFromList(user) {
  // 퇴장한 사용자 UI 제거
  const userElement = document.querySelector(`[data-user-id="${user.user_id}"]`);
  if (userElement) {
    userElement.remove();
  }
}

// 사용 예시:
/*
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 워크스페이스 ID는 페이지 컨텍스트나 URL에서 가져옴
    const workspaceId = getWorkspaceIdFromContext();
    
    // 워크스페이스 연결
    const { socket, leaveWorkspace } = await connectToWorkspace(workspaceId);
    
    // 페이지 이동 시 워크스페이스 퇴장
    window.addEventListener('beforeunload', () => {
      leaveWorkspace();
    });
    
  } catch (error) {
    console.error('초기화 실패:', error);
  }
});
*/
