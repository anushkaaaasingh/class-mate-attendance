import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Courses } from '@/components/Courses';
import { Timetable } from '@/components/Timetable';
import { Attendance } from '@/components/Attendance';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'timetable':
        return <Timetable />;
      case 'attendance':
        return <Attendance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main Content */}
      <div className="md:ml-64 min-h-screen pt-16 md:pt-0">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default Index;
