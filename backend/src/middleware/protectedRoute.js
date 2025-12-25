import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "먼저 로그인을 해주세요!" });
    }

    //토큰 검증
    const tokenPayload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(tokenPayload.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "인증 정보를 다시 입력해주세요!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`토큰 검증 에러 발생: ${error.message}`);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "토큰이 만료되었습니다. 다시 로그인해주세요." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
    }

    return res.status(500).json({ error: "internal server error.." });
  }
};

export default protectedRoute;
