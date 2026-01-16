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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
