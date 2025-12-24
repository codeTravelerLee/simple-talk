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

export const login = async (req, res) => {
  const { email, password } = req.body;

  //의도치 않은 공백 제거
  const cleanedEmail = email.trim();

  try {
    //두 필드가 모두 입력되었는지 확인
    if (!email || !password) {
      return res.status(400).json({ error: "모든 정보를 입력해 주세요!" });
    }

    //이메일로 가입된 유저 검색
    const foundUser = await User.findOne({ email: cleanedEmail });

    if (!foundUser) {
      return res
        .status(400)
        .json({ error: "이메일 또는 비밀번호를 확인해주세요." });
    }

    //계정이 잠겨있는지 확인(비밀번호를 여러번 틀린경우)
    if (foundUser.isAccountLocked && foundUser.lockedUntil > Date.now()) {
      const diff = foundUser.lockedUntil - Date.now();
      const minuteDiff = Math.ceil(diff / (60 * 1000));

      return res.status(403).json({
        error: `계정이 잠겼습니다. ${minuteDiff}분 후에 다시 시도해주세요.`,
      });
    }

    //비밀번호 확인
    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordMatch) {
      let updatedUser = await User.findOneAndUpdate(
        { _id: foundUser._id },
        { $inc: { passwordWrongCount: 1 } },
        { new: true }
      );

      //비밀번호를 틀리면 사용자에게 보낼 메시지
      let warningMessage = `비밀번호를 ${updatedUser.passwordWrongCount}회 틀리셨습니다.`;

      if (updatedUser.passwordWrongCount === 4) {
        warningMessage =
          "비밀번호를 4회 틀리셨습니다. 1회 더 틀리면 계정이 20분간 잠깁니다.";
      } else if (updatedUser.passwordWrongCount >= 5) {
        const LOCK_DURATION_TIME = 20 * 60 * 1000; //계정을 잠글 시간: 2o분
        
        updatedUser = await User.findOneAndUpdate(
          {
            _id: foundUser._id,
          },
          {
            $set: {
              isAccountLocked: true,
              lockedUntil: new Date(Date.now() + LOCK_DURATION_TIME),
            },
          }
        );

        warningMessage =
          "비밀번호를 5회 틀려 20분간 계정이 잠깁니다. 20분 후에 다시 시도해주세요.";
      }

      return res.status(400).json({
        error: warningMessage,
      });
    }

    //로그인 성공시 -> 기존에 누적된 틀린 횟수 초기화
    await User.updateOne(
      { _id: foundUser._id },
      {
        $set: {
          passwordWrongCount: 0,
          isAccountLocked: false,
          lockedUntil: null,
        },
      }
    );

    // 토큰발급
    await generateCookieAndSetToken(foundUser._id, res);

    res.status(200).json({ message: `${foundUser.fullName}님, 환영해요!` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "internal server error... process: 로그인" });
  }
};

export const logout = async (req, res) => {};
