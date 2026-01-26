import cron from "node-cron";
import User from "../models/user.model.js";
import { batchLogger } from "../../../logger.js";

export const runUserHardDeletionJob = () => {
  cron.schedule(
    "0 3 * * *",
    async () => {
      batchLogger.info("---  탈퇴 유저 영구 삭제 배치 작업 시작 ---");

      try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        const query = {
          isDeleted: true,
          deletedAt: { $lte: threeMonthsAgo },
          isUnderInvestigation: { $ne: true },
        };

        //model의 pre미들웨어 우회
        const result = await User.collection.deleteMany(query);

        if (result.deletedCount > 0) {
          batchLogger.info(
            ` ${result.deletedCount}명의 탈퇴 사용자 데이터를 영구 파기했습니다.`,
          );
        } else {
          batchLogger.info(" 삭제 대상인 탈퇴 사용자가 없습니다.");
        }
      } catch (error) {
        batchLogger.error(
          ` 탈퇴 유저 영구 삭제 배치 작업 중 에러 발생: ${error.message}`,
        );
      } finally {
        batchLogger.info(" 탈퇴 유저 영구 삭제 배치 작업 종료");
      }
    },
    { timezone: "Asia/Seoul" },
  );
};
