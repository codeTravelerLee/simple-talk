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
    profileImg: {
      type: String,
      default: "",
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
