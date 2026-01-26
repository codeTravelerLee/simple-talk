//쿠키 삭제
import redis from "../lib/redis.js";

export const clearCookie = async (req, res) => {
  await redis.del(`refresh_token_${req.user._id}`);

  const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
  };

  res.clearCookie("access_token", cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);
};
