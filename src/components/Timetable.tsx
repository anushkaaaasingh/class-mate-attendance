import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { Plus, Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export function Timetable() {
  const { courses, timeSlots: schedule, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useAttendanceStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  const [formData, setFormData] = useState({
    courseId: '',
    day: '',
    startTime: '',
    endTime: '',
    location: ''
  });

  const resetForm = () => {
    setFormData({
      courseId: '',
      day: '',
      startTime: '',
      endTime: '',
      location: ''
    });
    setEditingSlot(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.courseId || !formData.day || !formData.startTime || !formData.endTime || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    if (editingSlot) {
      updateTimeSlot(editingSlot.id, formData);
      toast({
        title: "Class Updated",
        description: "Class schedule has been updated successfully.",
      });
    } else {
      addTimeSlot(formData);
      toast({
        title: "Class Added",
        description: "New class has been added to your timetable.",
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      courseId: slot.courseId,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (slot) => {
    deleteTimeSlot(slot.id);
    const course = courses.find(c => c.id === slot.courseId);
    toast({
      title: "Class Removed",
      description: `${course?.name} class has been removed from your timetable.`,
    });
  };

  const getScheduleForDay = (day) => {
    return schedule
      .filter(slot => slot.day === day)
      .map(slot => ({
        ...slot,
        course: courses.find(c => c.id === slot.courseId)
      }))
      .filter(slot => slot.course)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground">Manage your weekly class schedule</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Edit Class' : 'Add New Class'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                          <span>{course.name} ({course.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={formData.startTime} onValueChange={(value) => setFormData({ ...formData, startTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select value={formData.endTime} onValueChange={(value) => setFormData({ ...formData, endTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 101, Building A"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSlot ? 'Update Class' : 'Add Class'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add some courses first before creating your timetable
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {days.slice(0, 6).map((day) => {
            const daySchedule = getScheduleForDay(day);
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {daySchedule.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No classes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySchedule.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 border rounded-lg bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-8 rounded-full"
                                style={{ backgroundColor: slot.course.color }}
                              />
                              <div>
                                <h4 className="font-medium text-sm">{slot.course.name}</h4>
                                <p className="text-xs text-muted-foreground">{slot.course.code}</p>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{slot.location}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(slot)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(slot)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}