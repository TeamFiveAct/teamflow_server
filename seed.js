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

async function seed() {
  try {
    // 데이터베이스 동기화 (force:true로 모든 테이블 초기화)
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // 1. Users 생성
    const users = await User.bulkCreate(
      [
        {
          email: 'user1@example.com',
          password_hash: 'hash1',
          nickname: 'User1',
          profile_image: 'https://example.com/user1.png',
          auth_provider: 'email',
        },
        {
          email: 'user2@example.com',
          password_hash: 'hash2',
          nickname: 'User2',
          profile_image: 'https://example.com/user2.png',
          auth_provider: 'email',
        },
        {
          email: 'user3@example.com',
          password_hash: 'hash3',
          nickname: 'User3',
          profile_image: 'https://example.com/user3.png',
          auth_provider: 'email',
        },
      ],
      { returning: true }
    );

    // 2. 각 User당 하나의 Workspace 생성
    const workspaces = await Promise.all(
      users.map((user) =>
        Workspace.create({
          space_title: `Workspace for ${user.nickname}`,
          space_description: 'Dummy workspace description',
          space_password: 'pass123',
          user_id: user.user_id,
        })
      )
    );

    // 3. WorkspaceMember 생성
    // 각 워크스페이스에 여러 멤버 추가 (owner 외 다른 사용자도 추가)
    const workspaceMembers = [];
    // workspace[0]: user1, user2 추가
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[0].space_id,
        user_id: users[0].user_id,
      })
    );
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[0].space_id,
        user_id: users[1].user_id,
      })
    );
    // workspace[1]: user2, user3 추가
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[1].space_id,
        user_id: users[1].user_id,
      })
    );
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[1].space_id,
        user_id: users[2].user_id,
      })
    );
    // workspace[2]: user1, user3 추가
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[2].space_id,
        user_id: users[0].user_id,
      })
    );
    workspaceMembers.push(
      await WorkspaceMember.create({
        space_id: workspaces[2].space_id,
        user_id: users[2].user_id,
      })
    );

    // 4. 각 워크스페이스에 채팅방(ChatRoom) 생성
    // 새 모델 구조에서는 ChatRoom이 workspace_id 필드만을 가집니다.
    const chatRooms = await Promise.all(
      workspaces.map((ws) =>
        ChatRoom.create({
          workspace_id: ws.space_id,
        })
      )
    );

    // 5. 각 채팅방에 메시지(Message) 생성
    const messages = [];
    for (const chatRoom of chatRooms) {
      // 해당 채팅방의 워크스페이스 멤버 조회 (WorkspaceMember 모델의 space_id 사용)
      const wsMembers = await WorkspaceMember.findAll({
        where: { space_id: chatRoom.workspace_id },
      });
      // 각 채팅방마다 2개의 메시지 생성 (순환하여 멤버 선택)
      for (let i = 0; i < 2; i++) {
        const member = wsMembers[i % wsMembers.length];
        messages.push(
          await Message.create({
            workspace_id: chatRoom.workspace_id,
            user_id: member.user_id,
            content: `Hello from user ${member.user_id} in workspace ${chatRoom.workspace_id}`,
            content_type: 'text',
          })
        );
      }
    }

    // 6. 각 워크스페이스에 투두(Todo) 생성 (각 워크스페이스당 2개씩)
    const todos = [];
    for (const ws of workspaces) {
      for (let i = 1; i <= 2; i++) {
        todos.push(
          await Todo.create({
            space_id: ws.space_id,
            title: `Todo ${i} for Workspace ${ws.space_id}`,
            description: 'Dummy todo description',
            priority: i % 2 === 0 ? 'high' : 'low',
            start_date: new Date(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
            status: 'plan',
          })
        );
      }
    }

    // 7. 각 Todo에 대해 Worker 생성 (해당 워크스페이스의 멤버 중 첫 번째 선택)
    const workers = [];
    for (const todo of todos) {
      const wsMembers = await WorkspaceMember.findAll({
        where: { space_id: todo.space_id },
      });
      if (wsMembers.length > 0) {
        workers.push(
          await Worker.create({
            todo_id: todo.todo_id,
            mem_id: wsMembers[0].mem_id,
          })
        );
      }
    }

    // 8. 태그(Tag) 생성
    const tags = await Tag.bulkCreate(
      [{ tag_name: 'Urgent' }, { tag_name: 'Home' }, { tag_name: 'Work' }],
      { returning: true }
    );

    // 9. 각 Todo에 대해 태그(TodoTags) 연관관계 설정 (예: 'Urgent'와 'Home' 태그 할당)
    for (const todo of todos) {
      await todo.addTags([tags[0], tags[1]]);
    }

    // 10. 각 User에 대해 패스워드 리셋(PasswordReset) 생성
    const passwordResets = [];
    for (const user of users) {
      passwordResets.push(
        await PasswordReset.create({
          user_id: user.user_id,
          token: `reset-token-${user.user_id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
          used: false,
        })
      );
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
