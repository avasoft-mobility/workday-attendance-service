import express, { Request, Response } from "express";
import LambdaClient from "../helpers/LambdaClient";
import { Rollbar } from "../helpers/Rollbar";
import Attendance from "../models/Attendance.model";
import AttendanceDb from "../schema/AttendanceSchema";
import {
  getAttendanceForParticularDates,
  getAttendanceStatus,
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
