import express, { Request, Response } from "express";
import { Rollbar } from "../helpers/Rollbar";
import Attendance from "../models/Attendance.model";
import AttendanceDb from "../schema/AttendanceSchema";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    if (req.query["userId"] && req.query["date"]) {
      const parsedDate = new Date(req.query["date"] as string);

      let query = {
        microsoftUserID: req.query["userId"],
        date: new Date(
          new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate()
          ).setHours(0, 0, 0, 0)
        ),
      };

      let attendance: Attendance[] = await AttendanceDb.find(query);

      var status =
        attendance.length > 0 ? attendance[0].attendance_status : "Not Filled";

      return res.status(200).json(status);
    }

    if (req.query["userId"] && req.query["fromDate"] && req.query["toDate"]) {
      const query = {
        $and: [
          { $gte: { date: req.query["fromDate"] as string } },
          { $lte: { date: req.query["toDate"] as string } },
          { microsoftUserID: req.query["userId"] as string },
        ],
      };
      let result = await AttendanceDb.find(query);
      var attendanceArray = JSON.parse(
        JSON.stringify(result)
          .replace(new RegExp("_id", "g"), "id")
          .replace(new RegExp("__v", "g"), "v")
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
