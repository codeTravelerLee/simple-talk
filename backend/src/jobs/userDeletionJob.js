import cron from "node-cron";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import UserBackup from "../models/UserBackup.model.js";

import { batchLogger } from "../../../logger.js";

export const runUserHardDeletionJob = () => {
  cron.schedule(
    "0 3 * * *",
    async () => {
      batchLogger.info("---  탈퇴 유저 영구 삭제 배치 작업 시작 ---");

      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        const query = {
          isDeleted: true,
          deletedAt: { $lte: threeMonthsAgo },
          isUnderInvestigation: { $ne: true },
        };

        const targetUsers = await User.collection
          .find(query, { session })
          .toArray();

        if (targetUsers.length === 0) {
          console.log(" 삭제 대상인 탈퇴 사용자가 없습니다.");
          batchLogger.info(" 삭제 대상인 탈퇴 사용자가 없습니다.");

          await session.abortTransaction();
          return;
        }

        //완전삭제전 사용자 정보 백업
        const userBackupData = targetUsers.map((user) => ({
          originalId: user._id,
          data: user,
          deletedAt: new Date(),
        }));

        await UserBackup.insertMany(userBackupData, { session });

        //model의 pre미들웨어 우회
        const result = await User.collection.deleteMany(query, { session });

        await session.commitTransaction();

        if (result.deletedCount > 0) {
          batchLogger.info(
            ` ${result.deletedCount}명의 탈퇴 사용자 데이터를 영구 파기했습니다.`,
          );
        } else {
          batchLogger.info(" 삭제 대상인 탈퇴 사용자가 없습니다.");
        }
      } catch (error) {
        await session.abortTransaction();
        batchLogger.error(
          ` 탈퇴 유저 영구 삭제 배치 작업 중 에러 발생: ${error.message}`,
        );
      } finally {
        batchLogger.info(" 탈퇴 유저 영구 삭제 배치 작업 종료");
        await session.endSession();
      }
    },
    { timezone: "Asia/Seoul" },
  );
};
