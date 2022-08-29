import express, { Request, Response } from "express";
import { Rollbar } from "../helpers/Rollbar";
import AttendanceDb from "../schema/AttendanceSchema";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await AttendanceDb.find();
    return res.status(200).json(response);
  } catch (error) {
    Rollbar.error(error as unknown as Error, req);
    res.status(500).json({ message: (error as unknown as Error).message });
  }
});

export { router as AttendanceRouter };
