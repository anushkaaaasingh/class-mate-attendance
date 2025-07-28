export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  color: string;
}

export interface TimeSlot {
  id: string;
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp?: string;
}

export interface DaySchedule {
  date: string;
  slots: (TimeSlot & { course: Course })[];
}