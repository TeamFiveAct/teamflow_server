const sequelize = require('./config/database'); // DB 연결 설정
const {
  User,
  Workspace,
  WorkspaceMember,
  ChatRoom,
  Message,
  Todo,
  Worker,
  Tag,
} = require('./models');

/** ───────────────────── 헬퍼 함수들 ───────────────────── **/

// 배열에서 랜덤 요소 선택
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 특정 기간 내 랜덤 날짜 생성 (과거~미래 범위 지정 가능)
function randomDateWithinDays(daysAgo = 30, maxFutureDays = 0) {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - daysAgo);

  const future = new Date();
  future.setDate(today.getDate() + maxFutureDays);

  const randomTime = past.getTime() + Math.random() * (future.getTime() - past.getTime());
  return new Date(randomTime);
}

// 랜덤 텍스트 생성
function createRandomText(wordCount = 5) {
  const words = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 
    'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'labore', 'dolore', 
    'magna', 'aliqua', 'testing', 'random', 'data', 'example', 'foo', 'bar'
  ];
  return Array.from({ length: wordCount }, () => randomItem(words)).join(' ');
}

(async () => {
  try {
    // 운영 환경에서는 force 사용 금지
    const isDev = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force: isDev, alter: !isDev });

    console.log('=== DB Sync 완료 ===');

    /** 1) Users 생성 **/
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
      });
    }
    const users = await User.bulkCreate(userBulkData, { returning: true });

    /** 2) Workspaces 생성 **/
    const workspaceBulkData = users.map(user => ({
      space_title: `Workspace_of_${user.nickname}`,
      space_description: `This is workspace owned by ${user.nickname}`,
      space_password: Math.random() < 0.5 ? '1234' : '',
      user_id: user.user_id,
    }));
    const workspaces = await Workspace.bulkCreate(workspaceBulkData, { returning: true });

    /** 3) WorkspaceMember 생성 **/
    let workspaceMembersData = [];
    for (let w of workspaces) {
      workspaceMembersData.push({ space_id: w.space_id, user_id: w.user_id });
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, 2);
      shuffledUsers.forEach(u => {
        if (u.user_id !== w.user_id) {
          workspaceMembersData.push({ space_id: w.space_id, user_id: u.user_id });
        }
      });
    }
    await WorkspaceMember.bulkCreate(workspaceMembersData);

    /** 4) ChatRoom 생성 **/
    const chatRooms = await ChatRoom.bulkCreate(workspaces.map(w => ({
      space_id: w.space_id,
      user_id: w.user_id,
    })), { returning: true });

    /** 5) Message 생성 **/
    const allMembers = await WorkspaceMember.findAll();
    const membersBySpace = {};
    allMembers.forEach(m => {
      if (!membersBySpace[m.space_id]) membersBySpace[m.space_id] = [];
      membersBySpace[m.space_id].push(m);
    });

    let messageData = [];
    chatRooms.forEach(room => {
      const possibleSenders = membersBySpace[room.space_id];
      for (let i = 0; i < 5 + Math.floor(Math.random() * 6); i++) {
        messageData.push({
          room_id: room.room_id,
          mem_id: randomItem(possibleSenders).mem_id,
          content: createRandomText(5 + Math.floor(Math.random() * 5)),
          content_type: 'text',
          created_at: randomDateWithinDays(10),
        });
      }
    });
    await Message.bulkCreate(messageData);

    /** 6) Todo 생성 **/
    let todoData = [];
    workspaces.forEach(w => {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
        const due_date = randomDateWithinDays(5, 3);
        const start_date = randomDateWithinDays(15, 0);
        todoData.push({
          space_id: w.space_id,
          title: `Todo_${w.space_id}_${i + 1}`,
          description: createRandomText(10),
          priority: randomItem(['low', 'medium', 'high']),
          start_date,
          due_date,
          status: randomItem(['plan', 'progress', 'done']),
          created_at: randomDateWithinDays(20),
        });
      }
    });
    const todos = await Todo.bulkCreate(todoData, { returning: true });

    /** 7) Worker 생성 **/
    let workerData = [];
    todos.forEach(t => {
      const memList = membersBySpace[t.space_id] || [];
      const selectedMembers = memList.sort(() => 0.5 - Math.random()).slice(0, 2);
      selectedMembers.forEach(m => workerData.push({ todo_id: t.todo_id, mem_id: m.mem_id }));
    });
    await Worker.bulkCreate(workerData);

    /** 8) Tag & TodoTag 생성 **/
    const tagCount = 5 + Math.floor(Math.random() * 4);
    const tags = await Tag.bulkCreate(Array.from({ length: tagCount }, (_, i) => ({
      tag_name: `Tag_${i + 1}`,
    })), { returning: true });

    await Promise.all(todos.map(async (t) => {
      const howMany = Math.floor(Math.random() * 3);
      if (howMany > 0) {
        const selectedTags = [...tags].sort(() => 0.5 - Math.random()).slice(0, howMany);
        await t.addTags(selectedTags);
      }
    }));

    console.log('=== 모든 더미 데이터 삽입 완료! ===');

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('시드 작업 중 오류 발생:', error);
    process.exit(1);
  }
})();
