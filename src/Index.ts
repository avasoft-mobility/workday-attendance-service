import { json } from "body-parser";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { AttendanceRouter } from "./router/AttendanceRouter";

const app = express();
app.use(json());

app.get("/", (request: Request, response: Response) => {
  return response.send("workday attendance service is healthy");
});

app.use("/attendance", AttendanceRouter)

mongoose.connect("mongodb://localhost:27017/workday", () => {
  console.log("Connected to DB");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
