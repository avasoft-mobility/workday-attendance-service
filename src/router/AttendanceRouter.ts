import express, { Request, Response } from "express";
import { Rollbar } from "../helpers/Rollbar";
import AttendanceDb from "../schema/AttendanceSchema";

const router = express.Router();

router.post("/getAttendance", (req: Request, res: Response) => {
  try {
    if (req.body["userid"] === null || req.body["userid"] === "") {
      return res.status(400).json({ message: "userid is required" });
    }
    if (req.body["date"] == null || req.body["date"] == "") {
      return res.status(400).json({ message: "date is required" });
    }

    getAttendance(req.body["userId"], req.body["date"])
      .then((attandance) => {
        var attendanceStatusArray = JSON.parse(
          JSON.stringify(attandance)
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
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    return res.status(500).json({ message: (error as unknown as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await AttendanceDb.find();
    return res.status(200).json(response);
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    res.status(500).json({ message: (error as unknown as Error).message });
  }
});

async function getAttendance(userid: string, date: string) {
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
}

export { router as AttendanceRouter };
