// seed.js
const sequelize = require('./config/database'); // DB 연결 설정
// models/index.js에서 export된 모델과 sequelize 인스턴스를 가져온다고 가정
const {
  User,
  Workspace,
  WorkspaceMember,
  ChatRoom,
  Message,
  Todo,
  Worker,
  Tag,
  // TodoTags 모델은 require하지 않아도 아래 associations에서 자동으로 참조됨
} = require('./models');

/** ───────────────────── 헬퍼 함수들 ───────────────────── **/
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinDays(daysAgo = 30) {
  // 현재 ~ daysAgo일 전 사이 임의 날짜 생성
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - daysAgo);
  const randomTime =
    past.getTime() + Math.random() * (today.getTime() - past.getTime());
  return new Date(randomTime);
}

function createRandomText(wordCount = 5) {
  const words = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'labore',
    'dolore',
    'magna',
    'aliqua',
    'testing',
    'random',
    'data',
    'example',
    'foo',
    'bar',
  ];
  let sentence = [];
  for (let i = 0; i < wordCount; i++) {
    sentence.push(randomItem(words));
  }
  return sentence.join(' ');
}

(async () => {
  try {
    /**
     * 만약 여기서 sync를 하고 싶다면, 아래 코드를 활성화하세요.
     * (이미 models/index.js에서 force: true가 수행 중이면 충돌 주의!)
     */
    await sequelize.sync({ force: true });
    console.log('=== DB Sync 완료 ===');

    /**
     * 1) Users 생성
     *    - User ↔ Workspace: 1:1 관계
     *    - 예: 5명의 사용자 생성 => 5개의 워크스페이스가 각각 대응
     */
    const userCount = 5;
    const userBulkData = [];
    for (let i = 1; i <= userCount; i++) {
      userBulkData.push({
        email: `user${i}@example.com`,
        password_hash: `hashed_pw_${i}`,
        salt: `salt_${i}`,
        nickname: `User${i}`,
        auth_provider: 'email',
        kako_id: null,
        // created_at: ...  (기본값 NOW)
      });
    }
    const users = await User.bulkCreate(userBulkData);
    console.log(`=== User ${users.length}명 생성 완료 ===`);

    /**
     * 2) Workspaces 생성
     *    - User와 1:1이므로, 각 User마다 하나씩 Workspace를 만들어 연결
     *    - Workspace.user_id = 각 user.user_id
     */
    const workspaceBulkData = [];
    for (let i = 0; i < users.length; i++) {
      workspaceBulkData.push({
        space_title: `Workspace_of_${users[i].nickname}`,
        space_description: `This is workspace owned by ${users[i].nickname}`,
        space_password: i % 2 === 0 ? '1234' : '', // 홀짝으로 비번 주거나 말거나
        user_id: users[i].user_id, // 1:1 관계에 맞춰 연결
        // created_at: ... (기본값 NOW)
      });
    }
    const workspaces = await Workspace.bulkCreate(workspaceBulkData);
    console.log(`=== Workspace ${workspaces.length}개 생성 완료 ===`);

    /**
     * 3) WorkspaceMember
     *    - 실제로는 "해당 워크스페이스의 멤버(소유자 포함)"를 나타내는 테이블
     *    - 여기서는 각 Workspace의 주인(해당 User)도 멤버로 추가하고,
     *      추가적으로 랜덤한 유저들도 멤버로 넣어봄
     */
    let workspaceMembersData = [];
    for (let w of workspaces) {
      // 우선 workspace의 owner를 member로 1명 추가
      workspaceMembersData.push({
        space_id: w.space_id,
        user_id: w.user_id, // owner 본인
      });

      // 나머지 유저 중, 중복되지 않게 1~2명 정도 임의 추가
      const shuffled = [...users].sort(() => 0.5 - Math.random());
      const extraMemberCount = 1 + Math.floor(Math.random() * 2); // 1~2
      let count = 0;
      for (let u of shuffled) {
        if (u.user_id !== w.user_id) {
          // owner가 아닌 유저만 추가
          workspaceMembersData.push({
            space_id: w.space_id,
            user_id: u.user_id,
          });
          count++;
        }
        if (count >= extraMemberCount) break;
      }
    }
    const workspaceMembers = await WorkspaceMember.bulkCreate(
      workspaceMembersData
    );
    console.log(
      `=== WorkspaceMember 총 ${workspaceMembers.length}개 생성 완료 ===`
    );

    /**
     * 4) ChatRoom
     *    - Workspace와 1:1 관계 => 각 Workspace마다 정확히 1개씩 생성
     *    - chat_rooms.user_id는 "ChatRoom 만든 사람"이라 가정
     *      여기서는 그냥 workspace의 owner로 지정
     */
    let chatRoomData = [];
    for (let w of workspaces) {
      chatRoomData.push({
        space_id: w.space_id,
        user_id: w.user_id, // 예: workspace의 owner가 chatRoom 생성
      });
    }
    const chatRooms = await ChatRoom.bulkCreate(chatRoomData);
    console.log(`=== ChatRoom 총 ${chatRooms.length}개 생성 완료 ===`);

    /**
     * 5) Message
     *    - 각 ChatRoom에 대해, 5~10개의 메시지를 생성
     *    - mem_id는 해당 워크스페이스 멤버 중 랜덤으로 지정
     */
    // 워크스페이스별 멤버를 빠르게 찾기 위한 해시
    const allMembers = await WorkspaceMember.findAll();
    const membersBySpace = {};
    allMembers.forEach((m) => {
      if (!membersBySpace[m.space_id]) membersBySpace[m.space_id] = [];
      membersBySpace[m.space_id].push(m);
    });

    let messageData = [];
    for (let room of chatRooms) {
      const { space_id, room_id } = room;
      const possibleSenders = membersBySpace[space_id];
      const messageCount = 5 + Math.floor(Math.random() * 6); // 5~10

      for (let i = 0; i < messageCount; i++) {
        const sender = randomItem(possibleSenders);
        messageData.push({
          room_id,
          mem_id: sender.mem_id,
          content: createRandomText(5 + Math.floor(Math.random() * 5)),
          content_type: 'text',
          created_at: randomDateWithinDays(10),
        });
      }
    }
    const messages = await Message.bulkCreate(messageData);
    console.log(`=== Message 총 ${messages.length}개 생성 완료 ===`);

    /**
     * 6) Todo
     *    - 각 Workspace마다 2~4개씩 Todo 생성
     */
    let todoData = [];
    for (let w of workspaces) {
      const todoCount = 2 + Math.floor(Math.random() * 3); // 2~4
      for (let i = 0; i < todoCount; i++) {
        todoData.push({
          space_id: w.space_id,
          title: `Todo_${w.space_id}_${i + 1}`,
          description: createRandomText(10),
          priority: randomItem(['low', 'medium', 'high']),
          start_date: randomDateWithinDays(15),
          due_date: randomDateWithinDays(5),
          status: randomItem(['plan', 'progress', 'done']),
          created_at: randomDateWithinDays(20),
        });
      }
    }
    const todos = await Todo.bulkCreate(todoData);
    console.log(`=== Todo 총 ${todos.length}개 생성 완료 ===`);

    /**
     * 7) Worker
     *    - Todo ↔ Worker (N:1): 하나의 Todo에 여러 Worker 가능
     *    - 해당 Todo가 속한 Workspace의 멤버 중 일부를 randomly 배정
     */
    // 다시 모든 Todo를 돌며, space_id를 찾아서 그 멤버 중 무작위로 1~2명 배정
    const updatedTodos = await Todo.findAll();
    let workerData = [];
    for (let t of updatedTodos) {
      const memList = membersBySpace[t.space_id] || [];
      const workerCount = 1 + Math.floor(Math.random() * 2); // 1~2
      const shuffled = [...memList].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, workerCount);
      for (const pm of picked) {
        workerData.push({
          todo_id: t.todo_id,
          mem_id: pm.mem_id, // 해당 워크스페이스의 멤버 중 랜덤
        });
      }
    }
    const workers = await Worker.bulkCreate(workerData);
    console.log(`=== Worker 총 ${workers.length}개 생성 완료 ===`);

    /**
     * 8) Tag & TodoTag (N:M)
     *    - 예: 전체적으로 5~8개의 Tag를 만들고,
     *      각 Todo에 0~2개 랜덤 할당
     */
    const tagCount = 5 + Math.floor(Math.random() * 4); // 5~8
    let tagData = [];
    for (let i = 1; i <= tagCount; i++) {
      tagData.push({
        tag_name: `Tag_${i}`,
      });
    }
    const tags = await Tag.bulkCreate(tagData);
    console.log(`=== Tag 총 ${tags.length}개 생성 완료 ===`);

    // 이제 각 Todo에 0~2개의 태그를 랜덤 연결
    for (let t of updatedTodos) {
      // 50% 확률로 아무 태그도 없는 Todo가 되도록
      const howMany = Math.floor(Math.random() * 3); // 0~2
      if (howMany > 0) {
        const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
        const selectedTags = shuffledTags.slice(0, howMany);

        // Sequelize의 belongsToMany 사용 시 setTags / addTags 등을 사용할 수도 있음
        // 여기서는 중간 테이블에 직접 삽입하는 방법을 사용
        await t.addTags(selectedTags);
      }
    }
    console.log(`=== Todo-Tag 관계 설정 완료 ===`);

    console.log('=== 모든 더미 데이터 삽입 완료! ===');
    process.exit(0);
  } catch (error) {
    console.error('시드 작업 중 오류 발생:', error);
    process.exit(1);
  }
})();
