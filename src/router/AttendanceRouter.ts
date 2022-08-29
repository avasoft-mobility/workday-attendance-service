import express, { Request, Response } from "express";
import AttendanceDb from "../schema/AttendanceSchema";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  return res.send("attendance Router hits");
});

export { router as AttendanceRouter };
