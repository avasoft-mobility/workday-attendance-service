import express, { Request, Response } from "express";
import LambdaClient from "../helpers/LambdaClient";
import { Rollbar } from "../helpers/Rollbar";
import AttendanceDb from "../schema/AttendanceSchema";
import {
  getAttendanceForParticularDates,
  getAttendanceStatus,
  updateOrCraeteAttendance,
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
      return response.status(400).json({ message: "userid is required" });
    }

    if (!request.query["date"]) {
      return response.status(400).json({ message: "date is required" });
    }

    if (
      request.body == null ||
      request.body == undefined ||
      (request.body.constructor === Object &&
        Object.keys(request.body).length === 0)
    ) {
      return response.status(400).json({ message: "body is required" });
    }

    const result = await updateOrCraeteAttendance(
      request.query["userId"] as string,
      request.body["attendanceStatus"] as string,
      request.query["date"] as string
    )

    return response.status(201).json(result);

  } catch (error: any) {
    Rollbar.error(error as unknown as Error, request);
    return response.status(500).json({ message: error.message });
  }
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
