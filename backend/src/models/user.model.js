import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    profileImg: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    passwordWrongCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    isAccountLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    //가장 최근 소켓에 연결된 시간
    lastSocketConnection: {
      type: Date,
      default: null,
    },
    //사용자 탈퇴 관련
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isUnderInvestigation: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//쿼리시 삭제되지 않은 유저만 대상으로!
userSchema.pre([/^find/, /^update/, /^delete/, /^count/], function () {
  this.where({ isDeleted: { $ne: true } });
});

userSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

const User = mongoose.model("User", userSchema);

export default User;
