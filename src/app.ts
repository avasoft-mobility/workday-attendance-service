import { json } from "body-parser";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { attendanceRouter } from "./router/AttendanceRouter";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(json());

mongoose.connect(process.env.DB_STRING!, () => {
  console.log("Connected to DB");
});

app.get("/", (request: Request, response: Response) => {
  return response.send("workday attendance service is healthy");
});

app.use("/attendance", attendanceRouter);

if (process.env.LAMBDA !== "TRUE") {
  app.listen(process.env.PORT_NUMBER!, () => {
    console.log(`Server is listening on port ${process.env.PORT_NUMBER}`);
  });
}

module.exports.lambdaHandler = serverless(app);
