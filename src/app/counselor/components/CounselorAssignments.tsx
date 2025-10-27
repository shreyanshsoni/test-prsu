import React, { useState, useEffect } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, UserPlus, UserMinus, Search, Filter } from 'lucide-react';

interface Student {
  student_user_id: string;
  profile_data: any;
  student_created_at: string;
}

interface CounselorAssignmentsProps {
  onClose: () => void;
}

const CounselorAssignments: React.FC<CounselorAssignmentsProps> = ({ onClose }) => {
  const { role } = useUserRole();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnassigned, setShowUnassigned] = useState(false);

  useEffect(() => {
    if (role === 'counselor') {
      fetchAssignedStudents();
      fetchAllStudents();
    }
  }, [role]);

  const fetchAssignedStudents = async () => {
    try {
      const response = await fetch('/api/counselor-assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignedStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching assigned students:', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      // This would need to be implemented - getting all students
      // For now, we'll use a placeholder
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching all students:', error);
      setIsLoading(false);
    }
  };

  const assignStudent = async (studentUserId: string) => {
    try {
      const response = await fetch('/api/counselor-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentUserId }),
      });

      if (response.ok) {
        await fetchAssignedStudents();
      }
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const unassignStudent = async (studentUserId: string) => {
    try {
      const response = await fetch('/api/counselor-assignments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentUserId }),
      });

      if (response.ok) {
        await fetchAssignedStudents();
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
    }
  };

  const filteredStudents = assignedStudents.filter(student => {
    const matchesSearch = searchTerm === '' || 
      (student.profile_data?.name && student.profile_data.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (role !== 'counselor') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`${isDark ? 'border-dark-border' : 'border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className={`w-6 h-6 ${isDark ? 'text-dark-text' : 'text-gray-600'}`} />
              <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                Student Assignments
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-gray-400'} w-4 h-4`} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showUnassigned 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : `${isDark ? 'text-dark-muted hover:text-dark-text hover:bg-dark-border' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Show Unassigned</span>
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                Loading students...
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className={`w-12 h-12 ${isDark ? 'text-dark-muted' : 'text-gray-400'} mx-auto mb-4`} />
              <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                {searchTerm ? 'No students match your search' : 'No students assigned yet'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div key={student.student_user_id} className={`flex items-center justify-between p-3 ${isDark ? 'bg-dark-background hover:bg-dark-border' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${isDark ? 'bg-dark-border' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                      <Users className={`w-5 h-5 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                        {student.profile_data?.name || 'Unnamed Student'}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                        Joined: {new Date(student.student_created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => unassignStudent(student.student_user_id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <UserMinus className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${isDark ? 'border-dark-border' : 'border-gray-200'} border-t px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} assigned
            </div>
            <button
              onClick={onClose}
              className={`px-4 py-2 ${isDark ? 'bg-dark-border hover:bg-dark-background text-dark-text' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-lg transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorAssignments;


