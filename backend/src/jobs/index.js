import { batchLogger } from "../../../logger.js";
import { runUserHardDeletionJob } from "./userDeletionJob.js";

export const initJobs = () => {
  batchLogger.info("batch작업 초기화 시작...");

  //batch작업 목록
  const Jobs = [runUserHardDeletionJob];

  Jobs.forEach((job) => job());

  batchLogger.info("batch작업 초기화 완료...");
};
