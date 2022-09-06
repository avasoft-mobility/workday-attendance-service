import Attendance from "../models/Attendance.model";
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
  const query = {
    $and: [
      { $gte: { date: fromDate } },
      { $lte: { date: toDate } },
      { microsoftUserID: userId },
    ],
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

export {
  getAttendanceStatus,
  getAttendanceForParticularDates,
  updateOrCraeteAttendance,
};
