import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

if (!process.env.REDIS_URL) {
  throw new Error("레디스 URL 읽어오기 실패!");
}

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("connected to redis...");
});

redis.on("error", (err) => {
  console.log(`redis error! : ${err}`);
});

export default redis;
