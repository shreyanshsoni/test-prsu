'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { StarryBackground } from '../components/ui/StarryBackground';
import { LogOut } from 'lucide-react';

interface Student {
  name: string;
  image: string;
  grade: number;
  collegeGoal: string;
  lastActivity: string;
  progress: number;
}

export default function CounselorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isClient, setIsClient] = useState(false);

  // Sample student data
  const students: Student[] = [
    {
      name: 'Sophia Lee',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 12,
      collegeGoal: 'Stanford',
      lastActivity: '3 days ago',
      progress: 85
    },
    {
      name: 'Jacob Mitchell',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 12,
      collegeGoal: 'Top Engineering School',
      lastActivity: '5 days ago',
      progress: 70
    },
    {
      name: 'Lily Carter',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 11,
      collegeGoal: 'Liberal Arts College',
      lastActivity: '8 days ago',
      progress: 60
    },
    {
      name: 'Ethan Rivera',
      image: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 11,
      collegeGoal: 'Ivy League',
      lastActivity: '10 days ago',
      progress: 55
    },
    {
      name: 'Isabella Green',
      image: 'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 12,
      collegeGoal: 'Pre-Med Program',
      lastActivity: '3 days ago',
      progress: 45
    },
    {
      name: 'Aiden Hughes',
      image: 'https://images.pexels.com/photos/2599510/pexels-photo-2599510.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 10,
      collegeGoal: 'Pre-Med Program',
      lastActivity: '40 days ago',
      progress: 40
    },
    {
      name: 'Mia Patel',
      image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 11,
      collegeGoal: 'In-State Program',
      lastActivity: '35 days ago',
      progress: 36
    },
    {
      name: 'Logan Turner',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
      grade: 10,
      collegeGoal: 'Local University',
      lastActivity: '20 days ago',
      progress: 20
    }
  ];

  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');

  // Filter students based on selected filters
  const filteredStudents = students.filter(student => {
    const matchesGrade = selectedGrade === 'All' || student.grade === parseInt(selectedGrade);
    const matchesGoal = selectedGoal === 'All' || student.collegeGoal === selectedGoal;
    return matchesGrade && matchesGoal;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if user is authenticated and has the counselor role
    if (isClient && !isLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'counselor') {
        router.push('/role-selection');
      }
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  if (!isClient || isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {isDark && <StarryBackground />}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center py-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Student Progress</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={logout} 
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2"
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col mb-4">
            <label className="mb-2 text-gray-700 dark:text-dark-text">Grade</label>
            <div className="relative">
              <select 
                className="appearance-none w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="All">All</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-dark-muted">
                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="mb-2 text-gray-700 dark:text-dark-text">College Goal</label>
            <div className="relative">
              <select 
                className="appearance-none w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
              >
                <option value="All">All</option>
                <option value="In-State Program">In-State Program</option>
                <option value="Ivy League">Ivy League</option>
                <option value="Liberal Arts College">Liberal Arts College</option>
                <option value="Local University">Local University</option>
                <option value="Pre-Med Program">Pre-Med Program</option>
                <option value="Stanford">Stanford</option>
                <option value="Top Engineering School">Top Engineering School</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-dark-muted">
                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-dark-border">
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-dark-text">Student</th>
                  <th className="py-3 px-2 text-center text-sm font-medium text-gray-700 dark:text-dark-text">Grade</th>
                  <th className="py-3 px-2 text-left text-sm font-medium text-gray-700 dark:text-dark-text">College Goal</th>
                  <th className="py-3 px-2 text-left text-sm font-medium text-gray-700 dark:text-dark-text">Last Activity</th>
                  <th className="py-3 px-2 text-left text-sm font-medium text-gray-700 dark:text-dark-text">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors duration-150">
                    <td className="py-4 pl-4 pr-2">
                      <div className="flex items-center">
                        <img 
                          src={student.image} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover mr-4"
                        />
                        <span className="font-medium text-gray-800 dark:text-dark-text">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-700 dark:text-dark-muted">{student.grade}</td>
                    <td className="py-4 px-2 text-gray-700 dark:text-dark-muted">{student.collegeGoal}</td>
                    <td className="py-4 px-2 text-gray-700 dark:text-dark-muted">{student.lastActivity}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-dark-border rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700 dark:text-dark-muted">{student.progress} %</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 