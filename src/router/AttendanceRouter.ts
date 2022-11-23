import express, { Request, Response } from "express";
import LambdaClient from "../helpers/LambdaClient";
import { Rollbar } from "../helpers/Rollbar";
import AttendanceDb from "../schema/AttendanceSchema";
import {
  getAttendanceForParticularDates,
  getAttendanceStatus,
  updateOrCraeteAttendance,
  getAttendanceForStats,
} from "../services/AttendenceSevice";

const router = express.Router();

router.get("/check", (req, res) => {
  return res.send({ message: "Attendance Service is working fine" });
});

router.get("/todos", async (req, res) => {
  const lambdaClient = new LambdaClient("Todos");
  const response = await lambdaClient.get("/todos/attendance");
  return res.send(response);
});

router.get("/mobile", async (req, res) => {
  const lambdaClient = new LambdaClient("Mobile");
  const response = await lambdaClient.get("/mobile/attendance");
  return res.send(response);
});

router.get("/users", async (req, res) => {
  const lambdaClient = new LambdaClient("Users");
  const response = await lambdaClient.post("/users/attendance");
  return res.send(response);
});

router.post("/", async (request: Request, response: Response) => {
  try {
    if (!request.query["userId"]) {
      return response.status(400).send({ message: "userid is required" });
    }

    if (!request.query["date"]) {
      return response.status(400).send({ message: "date is required" });
    }

    if (
      request.body == null ||
      request.body == undefined ||
      (request.body.constructor === Object &&
        Object.keys(request.body).length === 0)
    ) {
      return response.status(400).send({ message: "body is required" });
    }

    const result = await updateOrCraeteAttendance(
      request.query["userId"] as string,
      request.body["attendanceStatus"] as string,
      request.query["date"] as string
    );

    return response.status(201).send(result);
  } catch (error: any) {
    Rollbar.error(error as unknown as Error, request);
    return response.status(500).send({ message: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    if (req.query["userId"] && req.query["date"]) {
      const response = await getAttendanceStatus(
        req.query["date"] as string,
        req.query["userId"] as string
      );

      if (response.length === 0) {
        if (req.query["object"] === "true") {
          return res.status(200).send({
            attendance_status: "Not Filled",
            date: new Date(req.query["date"].toString()),
          });
        }
        return res.status(200).send({ status: "Not Filled" });
      }

      if (req.query["object"] === "true") {
        return res.status(200).send(response[0]);
      }

      var status =
        response.length > 0 ? response[0].attendance_status : "Not Filled";

      return res.status(200).send({ status: status });
    }

    if (req.query["userId"] && req.query["fromDate"] && req.query["toDate"]) {
      const attendanceArray = await getAttendanceForParticularDates(
        req.query["userId"] as string,
        req.query["fromDate"] as string,
        req.query["toDate"] as string
      );

      return res.status(200).send(attendanceArray);
    }

    const response = await AttendanceDb.find();
    return res.status(200).send(response);
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    return res
      .status(500)
      .send({ message: (error as unknown as Error).message });
  }
});

router.post("/bulk-retrieve", async (req: Request, res: Response) => {
  try {
    const userIds = req.body.userIds;
    const date = req.body.date;

    if (!userIds || (userIds as string[]).length === 0) {
      return res.status(400).send({ message: "User ids must be passed" });
    }

    if (!date) {
      return res.status(400).send({ message: "date must be passed" });
    }

    const parsedDate = new Date(date);
    var usersAttendance = await AttendanceDb.find({
      microsoftUserID: { $in: userIds as string[] },
      date: new Date(
        new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ).setHours(0, 0, 0, 0)
      ),
    });

    return res.status(200).send(usersAttendance);
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    return res
      .status(500)
      .send({ message: (error as unknown as Error).message });
  }
});

router.post("/stats", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    const interestedDate = req.body.interestedDate;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const reportings = req.body.reportings;

    const response = await getAttendanceForStats(
      userId as string,
      interestedDate as string,
      startDate as string,
      endDate as string,
      reportings
    );

    if (response.code === 200) {
      return res.status(response.code).send(response.body);
    }

    return res.status(response.code).send({ message: response.message });
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    res.status(500).json({ message: (error as unknown as Error).message });
  }
});

export { router as attendanceRouter };
