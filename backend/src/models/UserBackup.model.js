//사용자 정보 hard-delete시 추후 복구를 위한 백업

import mongoose from "mongoose";

const userBackupSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  data: {
    type: Object,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserBackup = mongoose.model("UserBackup", userBackupSchema);
export default UserBackup;
