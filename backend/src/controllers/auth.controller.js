import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateCookieAndSetToken } from "../middleware/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    const { email, fullName, password, passwordConfirm } = req.body;

    //필수 속성값들이 모두 제공되었는지 확인
    if (!email || !fullName || !password || !passwordConfirm) {
      return res.status(400).json({ error: "모든 정보를 입력해주세요." });
    }

    //사용자가 실수로 공백을 입력한 경우에 대비한 trim
    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    //이메일 주소가 유효한지 확인
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res
        .status(400)
        .json({ error: "올바르지 않은 이메일 주소입니다." });
    }

    //해당 이메일로 가입된 계정이 있는지 체크
    const emailAlreadySignedup = await User.findOne({ email: trimmedEmail });
    if (emailAlreadySignedup) {
      return res.status(400).json({ error: "이미 가입된 이메일 주소입니다." });
    }

    //비밀번호 길이 검증
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "비밀번호는 8글자 이상이어야 합니다." });
    }

    //비밀번호 형식 검사 - 영문, 특수문자, 숫자를 각각 하나 이상 포함하여 최소 8글자 이상
    //prettier-ignore
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "비밀번호는 영문, 특수문자, 숫자를 각각 하나 이상 포함하여 최소 8글자 이상이어야 합니다",
      });
    }

    //비밀번호 - 비밀번호 확인 두 필드에 입력된 값이 같은지 확인
    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: "두 비밀번호가 일치하지 않습니다.",
      });
    }

    //비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //유저객체 생성
    const newUser = new User({
      email: trimmedEmail,
      fullName: trimmedFullName,
      password: hashedPassword,
    });

    //토근발급, DB저장
    if (newUser) {
      await newUser.save();
      await generateCookieAndSetToken(newUser._id, res);

      //REMIND: 추후 생성된 user데이터 자체를 반환하도록 수정할 경우, password노출 안되게 주의할 것!
      res
        .status(201)
        .json({ message: `${newUser.fullName}님, 회원가입을 축하드려요!` });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "internal server error... process: 회원가입" });
  }
};

export const login = async (req, res) => {};

export const logout = async (req, res) => {};
