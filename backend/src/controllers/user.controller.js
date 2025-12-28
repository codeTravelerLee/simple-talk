import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import cloudinary from "../configs/cloudinary.js";

export const updateProfile = async (req, res) => {
  const userId = req.user._id;

  const { newFullName, newPassword, newPasswordConfirm } = req.body;
  let { newProfileImg } = req.body;

  const updateData = {}; //프로필 정보 변경 사항을 종합하는 객체

  try {
    //변경1 - fullName을 변경하고자 할 경우
    if (newFullName) {
      updateData.fullName = newFullName.trim(); //사용자가 실수로 입력한 공백 제거
    }

    //변경2 - 비밀번호를 변경하고자 할 경우
    if (newPassword) {
      //비밀번호 확인 값을 입력하지 않은 경우
      if (!newPasswordConfirm) {
        return res
          .status(400)
          .json({ error: "비밀번호 확인 칸을 입력해주세요!" });
      }

      //비밀번호 길이 검증
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "비밀번호는 8글자 이상이어야 합니다." });
      }

      //비밀번호 형식 검사 - 영문, 특수문자, 숫자를 각각 하나 이상 포함하여 최소 8글자 이상
      //prettier-ignore
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error:
            "비밀번호는 영문, 특수문자, 숫자를 각각 하나 이상 포함하여 최소 8글자 이상이어야 합니다",
        });
      }

      //비밀번호 - 비밀번호 확인 두 필드에 입력된 값이 같은지 확인
      if (newPassword !== newPasswordConfirm) {
        return res.status(400).json({
          error: "두 비밀번호가 일치하지 않습니다.",
        });
      }

      //해싱
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      updateData.password = hashedPassword;
    }

    //변경3 - 프로필 이미지를 변경하고자 할 경우
    if (newProfileImg) {
      const response = await cloudinary.uploader.upload(newProfileImg);
      newProfileImg = response.secure_url;

      updateData.profileImg = newProfileImg;
    }

    //변경사항이 없을 때 == updateData가 빈 객체일 경우 처리
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "변경할 내용을 입력해주세요." });
    }

    //변경사항을 모두 반영한 최신 유저 정보
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    }

    //성공 응답
    res.status(200).json({
      message: "프로필 정보를 성공적으로 변경했어요.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(`$프로필 변경중 에러 발생: ${error}`);

    res.status(500).json({
      error: "internal server error...",
    });
  }
};
