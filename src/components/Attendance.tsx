import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock3, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export function Attendance() {
  const { courses, attendanceRecords, getAttendancePercentage, getAttendanceForCourse } = useAttendanceStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  const filteredRecords = selectedCourseId === 'all' 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.courseId === selectedCourseId);

  const getAttendanceStats = () => {
    if (selectedCourseId === 'all') {
      const totalRecords = attendanceRecords.length;
      if (totalRecords === 0) return { present: 0, absent: 0, late: 0, percentage: 0 };
      
      const present = attendanceRecords.filter(r => r.status === 'present').length;
      const absent = attendanceRecords.filter(r => r.status === 'absent').length;
      const late = attendanceRecords.filter(r => r.status === 'late').length;
      
      return {
        present,
        absent,
        late,
        percentage: Math.round((present / totalRecords) * 100)
      };
    } else {
      const courseRecords = getAttendanceForCourse(selectedCourseId);
      const totalRecords = courseRecords.length;
      if (totalRecords === 0) return { present: 0, absent: 0, late: 0, percentage: 0 };
      
      const present = courseRecords.filter(r => r.status === 'present').length;
      const absent = courseRecords.filter(r => r.status === 'absent').length;
      const late = courseRecords.filter(r => r.status === 'late').length;
      
      return {
        present,
        absent,
        late,
        percentage: getAttendancePercentage(selectedCourseId)
      };
    }
  };

  const stats = getAttendanceStats();
  
  const getWeeklyAttendance = () => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start, end });
    
    return weekDays.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayRecords = filteredRecords.filter(record => record.date === dayString);
      
      return {
        day: format(day, 'EEE'),
        date: dayString,
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        late: dayRecords.filter(r => r.status === 'late').length,
        total: dayRecords.length
      };
    });
  };

  const weeklyData = getWeeklyAttendance();

  const getRecentRecords = () => {
    return filteredRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(record => ({
        ...record,
        course: courses.find(c => c.id === record.courseId)
      }))
      .filter(record => record.course);
  };

  const recentRecords = getRecentRecords();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Analytics</h1>
          <p className="text-muted-foreground">Track your attendance patterns and statistics</p>
        </div>
        
        <div className="w-48">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                    <span>{course.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-success">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock3 className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-warning">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-primary">{stats.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="font-medium">{day.day}</div>
                  <div className="flex items-center space-x-2">
                    {day.total > 0 ? (
                      <>
                        <div className="flex space-x-1">
                          {day.present > 0 && (
                            <Badge variant="default" className="h-6 px-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {day.present}
                            </Badge>
                          )}
                          {day.late > 0 && (
                            <Badge variant="secondary" className="h-6 px-2">
                              <Clock3 className="h-3 w-3 mr-1" />
                              {day.late}
                            </Badge>
                          )}
                          {day.absent > 0 && (
                            <Badge variant="destructive" className="h-6 px-2">
                              <XCircle className="h-3 w-3 mr-1" />
                              {day.absent}
                            </Badge>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No classes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Recent Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-8 rounded-full"
                        style={{ backgroundColor: record.course.color }}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{record.course.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(record.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={
                        record.status === 'present' ? 'default' : 
                        record.status === 'late' ? 'secondary' : 'destructive'
                      }
                    >
                      {record.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {record.status === 'late' && <Clock3 className="h-3 w-3 mr-1" />}
                      {record.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Overview */}
      {selectedCourseId === 'all' && courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => {
                const courseAttendance = getAttendancePercentage(course.id);
                const courseRecords = getAttendanceForCourse(course.id);
                
                return (
                  <div key={course.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-4 h-12 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.code}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Attendance Rate</span>
                        <Badge 
                          variant={courseAttendance >= 75 ? 'default' : courseAttendance >= 50 ? 'secondary' : 'destructive'}
                        >
                          {courseAttendance}%
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Classes</span>
                        <span className="text-sm font-medium">{courseRecords.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}