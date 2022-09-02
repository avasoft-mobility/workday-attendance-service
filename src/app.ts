import { json } from "body-parser";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { attendanceRouter } from "./router/AttendanceRouter";
import dotenv from "dotenv";
import serverless from "serverless-http";
import runMiddleware from "run-middleware";

dotenv.config();

const app = express();
runMiddleware(app);

app.use(json());

mongoose.connect(process.env.DB_STRING!, () => {
  console.log("Connected to DB");
});

app.get("/", (request: Request, response: Response) => {
  return response.send("workday attendance service is healthy");
});

app.use("/attendance", attendanceRouter);

app.use(
  "/attendance/*/functions/AttendancesFunction/invocations",
  (req: Request, res: Response) => {
    const payload = JSON.parse(Buffer.from(req.body).toString());
    (app as any).runMiddleware(
      payload.path,
      {
        method: payload.httpMethod,
        body: payload.body,
        query: payload.queryParams,
      },
      function (code: any, data: any) {
        res.send(data);
      }
    );
  }
);

if (process.env.LAMBDA !== "TRUE") {
  app.listen(process.env.PORT_NUMBER!, () => {
    console.log(`Server is listening on port ${process.env.PORT_NUMBER}`);
  });
}

module.exports.lambdaHandler = serverless(app);
