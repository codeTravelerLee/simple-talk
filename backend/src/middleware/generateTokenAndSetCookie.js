import jwt from "jsonwebtoken";
import redis from "../configs/redis.js";

export const generateCookieAndSetToken = async (userId, res) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  //레디스에 저장될 리프레시 토큰의 TTL
  const REDIS_REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; //7일

  //레디스에 리프레시 토큰 저장
  try {
    await redis.set(
      `refresh_token_${userId}`,
      refreshToken,
      "EX",
      REDIS_REFRESH_TOKEN_TTL
    );
  } catch (error) {
    console.error(`리프레시 토큰 redis저장중 에러발생: ${error.message}`);
    throw new Error(`리프레시 토큰 redis저장중 에러발생: ${error.message}`);
  }

  //쿠키에 저장
  res.cookie("access_token", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.cookie("refresh_token", refreshToken, {
    maxAge: 7 * 24 * 3600 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};
