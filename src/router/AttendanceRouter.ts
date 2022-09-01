import express, { Request, Response } from "express";
import { Rollbar } from "../helpers/Rollbar";
import AttendanceDb from "../schema/AttendanceSchema";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    if (req.query["userId"] && req.query["date"]) {
      getAttendance(req.query["userId"] as string, req.query["date"] as string)
        .then((_) => {
          var attendanceStatusArray = JSON.parse(
            JSON.stringify(_)
              .replace(new RegExp("_id", "g"), "id")
              .replace(new RegExp("__v", "g"), "v")
          );
          var status =
            attendanceStatusArray.length > 0
              ? attendanceStatusArray[0].attendance_status
              : "Not Filled";
          return res.status(200).json(status);
        })
        .catch((error) => {
          return res.status(400).json({ message: error.message });
        });
    }

    if (req.query["userId"] && req.query["fromDate"] && req.query["toDate"]) {
      getAttendanceRange(
        req.query["userId"] as string,
        req.query["fromDate"] as string,
        req.query["toDate"] as string
      ).then((_) => {
        var attendanceStatusArray = JSON.parse(
          JSON.stringify(_)
            .replace(new RegExp("_id", "g"), "id")
            .replace(new RegExp("__v", "g"), "v")
        );
        var status = attendanceStatusArray;
        return res.status(200).json(status);
      });
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

const getAttendance = async (userid: string, date: string) => {
  try {
    const parsedDate = new Date(date);

    let query = {
      microsoftUserID: userid,
      date: new Date(
        new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ).setHours(0, 0, 0, 0)
      ),
    };

    let result = await AttendanceDb.find(query);
    return result;
  } catch (error: any) {
    return { message: error.message };
  }
};

const getAttendanceRange = async (
  userid: string,
  fromDate: string,
  toDate: string
) => {
  try {
    const query = {
      $and: [
        { $gte: { date: fromDate } },
        { $lte: { date: toDate } },
        { microsoftUserID: userid },
      ],
    };
    let result = await AttendanceDb.find(query);
    return result;
  } catch (error: any) {
    return { message: error.message };
  }
};

export { router as AttendanceRouter };
