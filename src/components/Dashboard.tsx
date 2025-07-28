import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { CalendarDays, Clock, BookOpen, TrendingUp, CheckCircle, XCircle, Clock3 } from 'lucide-react';
import { format, isToday } from 'date-fns';

export function Dashboard() {
  const { courses, timeSlots, attendanceRecords, markAttendance, getAttendancePercentage } = useAttendanceStore();
  
  const today = new Date().toISOString().split('T')[0];
  const currentDay = format(new Date(), 'EEEE').toLowerCase();
  
  // Get today's schedule
  const todaySchedule = timeSlots
    .filter(slot => slot.day.toLowerCase() === currentDay)
    .map(slot => ({
      ...slot,
      course: courses.find(c => c.id === slot.courseId)!
    }))
    .filter(slot => slot.course)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get today's attendance records
  const todayAttendance = attendanceRecords.filter(record => record.date === today);

  const getAttendanceStatus = (courseId: string) => {
    return todayAttendance.find(record => record.courseId === courseId)?.status;
  };

  const overallAttendance = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + getAttendancePercentage(course.id), 0) / courses.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your day at a glance.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-primary">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold text-success">{overallAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
                <p className="text-2xl font-bold text-warning">{todaySchedule.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Classes Attended Today</p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {todayAttendance.filter(r => r.status === 'present').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((slot) => {
                const attendanceStatus = getAttendanceStatus(slot.courseId);
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-12 rounded-full"
                        style={{ backgroundColor: slot.course.color }}
                      />
                      <div>
                        <h3 className="font-semibold">{slot.course.name}</h3>
                        <p className="text-sm text-muted-foreground">{slot.course.code} • {slot.location}</p>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {attendanceStatus && (
                        <Badge 
                          variant={attendanceStatus === 'present' ? 'default' : attendanceStatus === 'late' ? 'secondary' : 'destructive'}
                          className="mb-2"
                        >
                          {attendanceStatus === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {attendanceStatus === 'late' && <Clock3 className="h-3 w-3 mr-1" />}
                          {attendanceStatus === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                        </Badge>
                      )}
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={attendanceStatus === 'present' ? 'default' : 'outline'}
                          onClick={() => markAttendance(slot.courseId, 'present')}
                          className="h-8"
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus === 'late' ? 'secondary' : 'outline'}
                          onClick={() => markAttendance(slot.courseId, 'late')}
                          className="h-8"
                        >
                          Late
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => markAttendance(slot.courseId, 'absent')}
                          className="h-8"
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}