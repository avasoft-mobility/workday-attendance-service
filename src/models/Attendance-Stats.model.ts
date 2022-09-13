import Attendance from "./Attendance.model";

interface AttendanceStats {
  interestedDateAttendance: Attendance[];
  dateIntervalAttendances: Attendance[];
  reportingDateIntervalAttendances: Attendance[];
}

export default AttendanceStats;
