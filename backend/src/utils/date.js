import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const KST = "Asia/Seoul";

export const toKSTFormat = (date) => {
  return dayjs(date).tz(KST).format("YYYY-MM-DD HH:mm:ss");
};

export default dayjs;
