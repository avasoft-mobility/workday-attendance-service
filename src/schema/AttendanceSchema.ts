import mongoose from "mongoose";
import Attendance from "../models/Attendance.model";

const attendanceSchema = new mongoose.Schema(
  {
    microsoftUserID: {
      type: String,
      required: true,
    },
    attendance_status: String,
    date: {
      type: Date,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Attendance>("attendances", attendanceSchema);
