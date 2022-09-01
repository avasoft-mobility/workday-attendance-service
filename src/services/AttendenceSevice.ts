import Attendance from "../models/Attendance.model";
import AttendanceDb from "../schema/AttendanceSchema";

const getAttendanceStatus = async (
  date: string,
  userId: string
): Promise<string> => {
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

  var status =
    attendance.length > 0 ? attendance[0].attendance_status : "Not Filled";

  return status;
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

export { getAttendanceStatus, getAttendanceForParticularDates };
