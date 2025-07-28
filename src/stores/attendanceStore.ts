import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, TimeSlot, AttendanceRecord } from '@/types';

interface AttendanceStore {
  courses: Course[];
  timeSlots: TimeSlot[];
  attendanceRecords: AttendanceRecord[];
  
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  addTimeSlot: (timeSlot: Omit<TimeSlot, 'id'>) => void;
  updateTimeSlot: (id: string, timeSlot: Partial<TimeSlot>) => void;
  deleteTimeSlot: (id: string) => void;
  
  markAttendance: (courseId: string, status: 'present' | 'absent' | 'late') => void;
  getAttendanceForCourse: (courseId: string) => AttendanceRecord[];
  getAttendancePercentage: (courseId: string) => number;
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      courses: [],
      timeSlots: [],
      attendanceRecords: [],
      
      addCourse: (course) => {
        const newCourse = { ...course, id: crypto.randomUUID() };
        set((state) => ({ courses: [...state.courses, newCourse] }));
      },
      
      updateCourse: (id, course) => {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...course } : c)),
        }));
      },
      
      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          timeSlots: state.timeSlots.filter((t) => t.courseId !== id),
          attendanceRecords: state.attendanceRecords.filter((a) => a.courseId !== id),
        }));
      },
      
      addTimeSlot: (timeSlot) => {
        const newTimeSlot = { ...timeSlot, id: crypto.randomUUID() };
        set((state) => ({ timeSlots: [...state.timeSlots, newTimeSlot] }));
      },
      
      updateTimeSlot: (id, timeSlot) => {
        set((state) => ({
          timeSlots: state.timeSlots.map((t) => (t.id === id ? { ...t, ...timeSlot } : t)),
        }));
      },
      
      deleteTimeSlot: (id) => {
        set((state) => ({
          timeSlots: state.timeSlots.filter((t) => t.id !== id),
        }));
      },
      
      markAttendance: (courseId, status) => {
        const today = new Date().toISOString().split('T')[0];
        const existingRecord = get().attendanceRecords.find(
          (record) => record.courseId === courseId && record.date === today
        );
        
        if (existingRecord) {
          set((state) => ({
            attendanceRecords: state.attendanceRecords.map((record) =>
              record.id === existingRecord.id
                ? { ...record, status, timestamp: new Date().toISOString() }
                : record
            ),
          }));
        } else {
          const newRecord: AttendanceRecord = {
            id: crypto.randomUUID(),
            courseId,
            date: today,
            status,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({
            attendanceRecords: [...state.attendanceRecords, newRecord],
          }));
        }
      },
      
      getAttendanceForCourse: (courseId) => {
        return get().attendanceRecords.filter((record) => record.courseId === courseId);
      },
      
      getAttendancePercentage: (courseId) => {
        const records = get().attendanceRecords.filter((record) => record.courseId === courseId);
        if (records.length === 0) return 0;
        
        const presentCount = records.filter((record) => record.status === 'present').length;
        return Math.round((presentCount / records.length) * 100);
      },
    }),
    {
      name: 'attendance-store',
    }
  )
);