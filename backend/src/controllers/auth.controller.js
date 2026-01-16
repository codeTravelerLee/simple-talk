import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { generateCookieAndSetToken } from "../middleware/generateTokenAndSetCookie.js";
import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import { sendVerificationEmail } from "../lib/email.js";

export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({ currentUser: req.user });
  } catch (error) {
    res.status(500).json({ error: "internal server error..." });
  }
};

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
      res.status(201).json({
        message: `${newUser.fullName}님, 회원가입을 축하드려요!`,
        userData: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profileImg: newUser.profileImg,
          joinedAt: newUser.createdAt,
        },
      });
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
  const cleanedEmail = email?.trim();

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

    //프론트로 전달할 데이터
    const userData = {
      _id: foundUser._id,
      email: foundUser.email,
      fullName: foundUser.fullName,
      profileImg: foundUser.profileImg,
      joinedAt: foundUser.createdAt,
    };

    res.status(200).json({
      message: `${foundUser.fullName}님, 환영해요!`,
      userData: userData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "internal server error... process: 로그인" });
  }
};

export const logout = async (req, res) => {
  try {
    //레디스에 저장된 리프레시 토큰 삭제
    await redis.del(`refresh_token_${req.user._id}`);

    //쿠키 삭제
    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    };

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    res.status(204).end();
  } catch (error) {
    console.error(`로그아웃중 에러 발생: ${error}`);

    res.status(500).json({ error: "internal server error..." });
  }
};

//이메일 인증 코드 전송 - 이메일로 회원가입 하는 경우
export const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    //이메일 주소가 유효한지 확인
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "올바르지 않은 이메일 주소입니다." });
    }

    //해당 이메일로 가입된 계정이 이미 존재하는지 확인
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ error: "이미 가입된 이메일 주소입니다." });
    }

    //이메일 인증 코드 생성 및 저장 (임시로 6자리 숫자)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Redis에 인증 코드 저장 (10분 후 만료)
    await redis.setex(`email_verification_${email}`, 60 * 10, verificationCode);

    // 이메일 전송
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: "인증 코드가 이메일로 전송되었습니다." });
  } catch (error) {
    console.error(
      `이메일 인증 코드 전송 중 에러 발생: ${error.message || error}`
    );
    res.status(500).json({
      error: "internal server error... process: 이메일 인증 코드 전송",
    });
  }
};

//이메일 인증 코드 확인
export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    //Redis에서 저장된 인증 코드 가져오기
    const storedCode = await redis.get(`email_verification_${email}`);

    if (!storedCode) {
      return res
        .status(400)
        .json({ error: "인증 코드가 만료되었거나 존재하지 않습니다." });
    }

    if (storedCode !== code) {
      return res.status(400).json({ error: "인증 코드가 올바르지 않습니다." });
    }

    //인증 성공 시 Redis에서 코드 삭제
    await redis.del(`email_verification_${email}`);

    res.status(200).json({ message: "이메일 인증이 완료되었습니다." });
  } catch (error) {
    console.error(
      `이메일 인증 코드 확인 중 에러 발생: ${error.message || error}`
    );
    res.status(500).json({
      error: "internal server error... process: 이메일 인증 코드 확인",
    });
  }
};

//회원가입 과정에서 입력한 부가 정보 저장(성별, 생년월일)
export const saveAdditionalSignupInfo = async (req, res) => {
  try {
    const { dateOfBirth, gender } = req.body;
    let { profileImg } = req.body; //사진은 필수 속성 아님

    const userId = req.user._id;

    //필수 속성값들이 모두 제공되었는지 확인
    if (!gender || !dateOfBirth) {
      return res.status(400).json({ error: "모든 정보를 입력해주세요." });
    }

    //프로필 사진을 선택한 경우
    let profileImageData = {};

    if (profileImg) {
      //이미지 추가
      const response = await cloudinary.uploader.upload(profileImg, {
        folder: "user_profile",
      });

      profileImg = response.secure_url;
      const publicId = response.public_id;

      profileImageData = {
        url: profileImg,
        publicId: publicId,
      };
    }

    //유저 정보 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { gender, dateOfBirth, profileImg: profileImageData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "추가 회원정보가 저장되었습니다.",
      userData: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        profileImg: updatedUser.profileImg,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        joinedAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error(`추가 회원정보 저장 중 에러 발생: ${error.message || error}`);
    res.status(500).json({
      error: "internal server error... process: 추가 회원정보 저장",
    });
  }
};
