import express, { Request, Response } from "express";
import { Rollbar } from "../helpers/Rollbar";
import Attendance from "../models/Attendance.model";
import AttendanceDb from "../schema/AttendanceSchema";
import {
  getAttendanceForParticularDates,
  getAttendanceStatus,
} from "../services/AttendenceSevice";

const router = express.Router();

router.get("/check", (req, res) => {
  return res.send("Attendance Service is working fine");
});

router.get("/", async (req: Request, res: Response) => {
  try {
    if (req.query["userId"] && req.query["date"]) {
      const status = await getAttendanceStatus(
        req.query["date"] as string,
        req.query["userId"] as string
      );

      return res.status(200).json(status);
    }

    if (req.query["userId"] && req.query["fromDate"] && req.query["toDate"]) {
      const attendanceArray = await getAttendanceForParticularDates(
        req.query["userId"] as string,
        req.query["fromDate"] as string,
        req.query["toDate"] as string
      );

      return res.status(200).json(attendanceArray);
    }

    const response = await AttendanceDb.find();
    return res.status(200).json(response);
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    return res
      .status(500)
      .json({ message: (error as unknown as Error).message });
  }
});

export { router as attendanceRouter };
