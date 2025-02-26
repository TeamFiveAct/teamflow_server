const {Op} = require("sequelize");
const User = require("../models/User");

const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const deleteOldUsers = async () => {
    try {
      const deletedUsers = await User.destroy({
        where: {
          deleted_at: { [Op.lt]: threeMonthsAgo }, // 3개월 이상 지난 계정 삭제
        },
        force: true, 
      });
  
      console.log(`${deletedUsers}명의 탈퇴 유저가 DB에서 삭제되었습니다.`);
    } catch (error) {
      console.error('탈퇴 유저 삭제 중 오류 발생:', error);
    }
  };
  
  // 스크립트 실행 (테스트용)
  if (require.main === module) {
    deleteOldUsers();
  }
  
  module.exports = deleteOldUsers;