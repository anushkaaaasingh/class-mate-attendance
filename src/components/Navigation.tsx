import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, Calendar, BarChart3, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', name: 'Courses', icon: BookOpen },
  { id: 'timetable', name: 'Timetable', icon: Calendar },
  { id: 'attendance', name: 'Attendance', icon: BarChart3 },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">ClassMate</h1>
          <p className="text-sm text-muted-foreground">Attendance Tracker</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  currentPage === item.id && 'bg-primary text-primary-foreground shadow-md'
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-primary">ClassMate</h1>
            <p className="text-xs text-muted-foreground">Attendance Tracker</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      currentPage === item.id && 'bg-primary text-primary-foreground shadow-md'
                    )}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}