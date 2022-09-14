import moment from "moment";
import AttendanceStats from "../models/Attendance-Stats.model";
import Attendance from "../models/Attendance.model";
import ServiceResponse from "../models/Service-Response.model";
import AttendanceDb from "../schema/AttendanceSchema";

const getAttendanceStatus = async (
  date: string,
  userId: string
): Promise<Attendance[]> => {
  const attendance = await getAttendance(date, userId);

  return attendance;
};

const getAttendanceForParticularDates = async (
  userId: string,
  fromDate: string,
  toDate: string
): Promise<Attendance[]> => {
  const parsedFromDate = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
  const parsedToDate = new Date(new Date(toDate).setHours(0, 0, 0, 0));

  console.log("parsedFromDate", parsedFromDate);
  console.log("parsedToDate", parsedToDate);
  console.log("userId", userId);

  const query = {
    date: { $gte: parsedFromDate, $lte: moment(parsedToDate).add(1).toDate() },
    microsoftUserID: userId,
  };

  let result = await AttendanceDb.find(query);
  var attendanceArray = JSON.parse(
    JSON.stringify(result)
      .replace(new RegExp("_id", "g"), "id")
      .replace(new RegExp("__v", "g"), "v")
  );

  return attendanceArray;
};

const updateOrCraeteAttendance = async (
  userId: string,
  attendanceStatus: string,
  date: string
) => {
  const parsedDate = new Date(date);

  const query = {
    microsoftUserID: userId,
    date: new Date(
      new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ).setHours(0, 0, 0, 0)
    ),
  };
  const update = {
    $set: {
      microsoftUserID: userId,
      date: new Date(
        new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ).setHours(0, 0, 0, 0)
      ),
      attendance_status: attendanceStatus,
    },
  };
  const options = { upsert: true };

  let result = await AttendanceDb.updateOne(query, update, options);

  const attendance = await getAttendance(date, userId);

  return attendance;
};

const getAttendance = async (
  date: string,
  userId: string
): Promise<Attendance[]> => {
  const parsedDate = new Date(date);
  console.log("parsedDate", parsedDate);

  let query = {
    microsoftUserID: userId,
    date: new Date(
      new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ).setHours(0, 0, 0, 0)
    ),
  };

  let attendance: Attendance[] = await AttendanceDb.find(query);

  return attendance;
};

const getMultiUserInterestedDateAttendance = async (
  date: string,
  users: string[]
) => {
  const parsedDate = new Date(date);

  let query = {
    microsoftUserID: { $in: users },
    date: new Date(
      new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ).setHours(0, 0, 0, 0)
    ),
  };

  let attendance: Attendance[] = await AttendanceDb.find(query);
  return attendance;
};

const getAttendanceForStats = async (
  userId: string,
  interestedDate: string,
  startDate: string,
  endDate: string,
  reportings: string[]
): Promise<ServiceResponse<AttendanceStats>> => {
  if (!userId) {
    return { code: 400, message: "User Id is required" };
  }

  if (!interestedDate) {
    return { code: 400, message: "Interested Date is required" };
  }

  if (!startDate) {
    return { code: 400, message: "Start Date is required" };
  }

  if (!endDate) {
    return { code: 400, message: "End Date is required" };
  }

  const interestedDateAttendance = (await getAttendance(
    interestedDate,
    userId
  )) as Attendance[];

  const dateIntervelAttendance = (await getAttendanceForParticularDates(
    userId,
    startDate,
    endDate
  )) as Attendance[];

  const reportingInterestedDateAttendances =
    await getMultiUserInterestedDateAttendance(interestedDate, reportings);

  return {
    code: 200,
    body: {
      dateIntervalAttendances: dateIntervelAttendance,
      interestedDateAttendance: interestedDateAttendance,
      reportingInterestedDateAttendances: reportingInterestedDateAttendances,
    },
  };
};

export {
  getAttendanceStatus,
  getAttendanceForParticularDates,
  updateOrCraeteAttendance,
  getAttendanceForStats,
};
