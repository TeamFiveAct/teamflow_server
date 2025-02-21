// seed.js
const sequelize = require('./config/database');
const {
  User,
  Workspace,
  WorkspaceMember,
  ChatRoom,
  Message,
  Todo,
  Worker,
  Tag,
  PasswordReset,
} = require('./models');

(async () => {
  try {
    // 데이터 초기화를 원한다면 아래 주석 해제 (주의: 기존 데이터가 모두 삭제됩니다)
    // await sequelize.sync({ force: true });
    // 혹은 각각의 모델에서 truncate를 수행할 수도 있습니다.

    // ── 1. User 생성 ───────────────────────────────
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const user = await User.create({
        email: `user${i}@example.com`,
        password_hash: 'hashedpassword', // 더미 패스워드
        nickname: `User${i}`,
        profile_image: `https://example.com/images/user${i}.png`,
        auth_provider: 'email',
        kakao_id: null,
        access_token: null,
        refresh_token: null,
        deleted_at: null,
        created_at: new Date(),
      });
      users.push(user);
    }

    // ── 2. 각 User에 대해 Workspace 생성 ───────────────────────────────
    const workspaces = [];
    for (const user of users) {
      const workspace = await Workspace.create({
        space_title: `${user.nickname}'s Workspace`,
        space_description: `This is ${user.nickname}'s workspace.`,
        space_password: 'workspacePassword',
        user_id: user.user_id,
        created_at: new Date(),
      });
      workspaces.push(workspace);
    }

    // ── 3. WorkspaceMember 생성 ───────────────────────────────
    // 각 Workspace에 대해 소유자(member)와 추가 더미 멤버 3명을 생성합니다.
    const workspaceMembers = [];
    for (const workspace of workspaces) {
      // 소유자(member)
      const ownerMember = await WorkspaceMember.create({
        space_id: workspace.space_id,
        user_id: workspace.user_id,
      });
      workspaceMembers.push(ownerMember);

      // 추가 멤버 3명 (신규 User로 생성)
      for (let j = 1; j <= 3; j++) {
        const dummyUser = await User.create({
          email: `dummy_${workspace.space_id}_${j}@example.com`,
          password_hash: 'dummyPassword',
          nickname: `Dummy${workspace.space_id}_${j}`,
          profile_image: `https://example.com/images/dummy${workspace.space_id}_${j}.png`,
          auth_provider: 'email',
          kakao_id: null,
          access_token: null,
          refresh_token: null,
          deleted_at: null,
          created_at: new Date(),
        });
        const member = await WorkspaceMember.create({
          space_id: workspace.space_id,
          user_id: dummyUser.user_id,
        });
        workspaceMembers.push(member);
      }
    }

    // ── 4. 각 Workspace에 대해 ChatRoom 생성 ───────────────────────────────
    const chatRooms = [];
    for (const workspace of workspaces) {
      const chatRoom = await ChatRoom.create({
        space_id: workspace.space_id,
        user_id: workspace.user_id, // 소유자 ID 사용
      });
      chatRooms.push(chatRoom);
    }

    // ── 5. 각 ChatRoom에 대해 Message 생성 ───────────────────────────────
    for (const chatRoom of chatRooms) {
      // 해당 workspace의 모든 멤버를 조회
      const members = await WorkspaceMember.findAll({
        where: { space_id: chatRoom.space_id },
      });

      // 각 chatRoom에 5개의 메시지 생성
      for (let m = 1; m <= 5; m++) {
        const randomMember =
          members[Math.floor(Math.random() * members.length)];
        await Message.create({
          room_id: chatRoom.room_id,
          mem_id: randomMember.mem_id,
          content: `This is message ${m} in room ${chatRoom.room_id}.`,
          content_type: 'text',
          created_at: new Date(),
        });
      }
    }

    // ── 6. 각 Workspace에 대해 Todo 생성 ───────────────────────────────
    const todos = [];
    for (const workspace of workspaces) {
      for (let t = 1; t <= 5; t++) {
        const todo = await Todo.create({
          space_id: workspace.space_id,
          title: `Todo ${t} for workspace ${workspace.space_id}`,
          description: `Description for Todo ${t} in workspace ${workspace.space_id}`,
          priority: t % 3 === 0 ? 'high' : t % 2 === 0 ? 'medium' : 'low',
          start_date: new Date(),
          due_date: new Date(Date.now() + 86400000 * t), // t일 후 마감
          status: t % 3 === 0 ? 'done' : 'progress',
          created_at: new Date(),
          deleted_at: null,
        });
        todos.push(todo);
      }
    }

    // ── 7. 각 Todo에 대해 Worker 할당 ───────────────────────────────
    for (const todo of todos) {
      // 해당 workspace의 멤버들을 조회
      const members = await WorkspaceMember.findAll({
        where: { space_id: todo.space_id },
      });
      // 2명의 랜덤 멤버를 Worker로 지정
      for (let w = 0; w < 2; w++) {
        const randomMember =
          members[Math.floor(Math.random() * members.length)];
        await Worker.create({
          todo_id: todo.todo_id,
          mem_id: randomMember.mem_id,
        });
      }
    }

    // ── 8. Tag 생성 및 Todo와의 다대다 관계 설정 ───────────────────────────────
    const tagNames = ['Urgent', 'Important', 'Bug', 'Feature', 'Enhancement'];
    const tags = [];
    for (const tagName of tagNames) {
      const tag = await Tag.create({
        tag_name: tagName,
      });
      tags.push(tag);
    }

    // 각 Todo마다 랜덤으로 태그를 할당 (최소 1개)
    for (const todo of todos) {
      // 랜덤 필터링: 50% 확률로 선택
      let selectedTags = tags.filter(() => Math.random() > 0.5);
      if (selectedTags.length === 0) {
        selectedTags = [tags[Math.floor(Math.random() * tags.length)]];
      }
      // setTags 메서드는 TodoTags 중간 테이블에 데이터를 삽입합니다.
      await todo.setTags(selectedTags);
    }

    // ── 9. 각 User에 대해 PasswordReset 생성 ───────────────────────────────
    for (const user of users) {
      await PasswordReset.create({
        user_id: user.user_id,
        token: `reset-token-${user.user_id}-${Date.now()}`,
        expires_at: new Date(Date.now() + 3600000), // 1시간 후 만료
        used: false,
        created_at: new Date(),
      });
    }

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
})();
