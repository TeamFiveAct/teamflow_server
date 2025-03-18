const { faker } = require('@faker-js/faker');
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
} = require('./models');

(async () => {
  try {
    // 기존 테이블을 재생성
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // 1. 사용자 생성 (예: 50명)
    const users = [];
    for (let i = 0; i < 50; i++) {
      const user = await User.create({
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        nickname: faker.internet.username(), // 변경: userName() -> username()
        profile_image: faker.image.avatar(),
        auth_provider: 'email',
        kakao_id: null,
        access_token: faker.string.uuid(), // 변경: datatype.uuid() -> string.uuid()
        refresh_token: faker.string.uuid(), // 변경: datatype.uuid() -> string.uuid()
        created_at: new Date(),
      });
      users.push(user);
    }

    // 2. 각 사용자별 워크스페이스 생성 (1:1 관계)
    const workspaces = [];
    for (const user of users) {
      const workspace = await Workspace.create({
        space_title: faker.company.name(), // 변경: company.companyName() -> company.name()
        space_description: faker.lorem.sentence(),
        space_password: faker.internet.password(),
        user_id: user.user_id,
        created_at: new Date(),
      });
      workspaces.push(workspace);
    }

    // 3. 워크스페이스 멤버 생성 (소유자 포함, 추가 멤버 랜덤 할당)
    for (const workspace of workspaces) {
      // 워크스페이스 소유자 추가
      await WorkspaceMember.create({
        space_id: workspace.space_id,
        user_id: workspace.user_id,
      });
      // 추가 멤버 (2~6명)
      const numAdditional = faker.number.int({ min: 2, max: 6 });
      const additionalMembers = faker.helpers
        .shuffle(users)
        .slice(0, numAdditional);
      for (const member of additionalMembers) {
        if (member.user_id === workspace.user_id) continue;
        await WorkspaceMember.create({
          space_id: workspace.space_id,
          user_id: member.user_id,
        });
      }
    }

    // 4. 각 워크스페이스별 채팅방 생성 (1:1 관계)
    const chatRooms = [];
    for (const workspace of workspaces) {
      const chatRoom = await ChatRoom.create({
        workspace_id: workspace.space_id,
      });
      chatRooms.push(chatRoom);
    }

    // 5. 채팅방별 메시지 생성 (메시지 N:1 관계)
    for (const chatRoom of chatRooms) {
      // 채팅방이 속한 워크스페이스의 멤버 조회
      const members = await WorkspaceMember.findAll({
        where: { space_id: chatRoom.workspace_id },
      });
      const numMessages = faker.number.int({ min: 5, max: 15 });
      for (let i = 0; i < numMessages; i++) {
        const randomMember = faker.helpers.shuffle(members)[0];
        await Message.create({
          workspace_id: chatRoom.workspace_id,
          user_id: randomMember.user_id,
          content: faker.lorem.sentence(),
          content_type: 'text',
          created_at: new Date(),
        });
      }
    }

    // 6. 각 워크스페이스별 할 일(Todo) 생성 (N:1 관계)
    const todos = [];
    for (const workspace of workspaces) {
      const numTodos = faker.number.int({ min: 3, max: 8 });
      for (let i = 0; i < numTodos; i++) {
        const todo = await Todo.create({
          space_id: workspace.space_id,
          title: faker.lorem.words(3),
          description: faker.lorem.sentences(2),
          priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
          start_date: faker.date.past(),
          due_date: faker.date.future(),
          status: faker.helpers.arrayElement(['plan', 'progress', 'done']),
          created_at: new Date(),
        });
        todos.push(todo);
      }
    }

    // 7. 각 할 일에 대해 작업자(Worker) 생성 (여러 명 참여 가능)
    for (const todo of todos) {
      const members = await WorkspaceMember.findAll({
        where: { space_id: todo.space_id },
      });
      const numWorkers = faker.number.int({ min: 1, max: members.length });
      const selectedMembers = faker.helpers
        .shuffle(members)
        .slice(0, numWorkers);
      for (const member of selectedMembers) {
        await Worker.create({
          todo_id: todo.todo_id,
          mem_id: member.mem_id,
        });
      }
    }

    // 8. 태그(Tag) 생성 (예: 10개)
    const tags = [];
    for (let i = 0; i < 10; i++) {
      const tag = await Tag.create({
        tag_name: faker.lorem.word(),
      });
      tags.push(tag);
    }

    // 9. 할 일과 태그의 다대다 관계 설정 (TodoTags 중간 테이블 활용)
    for (const todo of todos) {
      const numTags = faker.number.int({ min: 1, max: 3 });
      const selectedTags = faker.helpers.shuffle(tags).slice(0, numTags);
      await todo.addTags(selectedTags);
    }

    console.log('Seed data created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
})();
