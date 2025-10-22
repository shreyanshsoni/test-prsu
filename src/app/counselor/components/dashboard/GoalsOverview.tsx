import React, { useState, useMemo } from 'react';
import { Student } from '../../../types/counselor';
import { CheckCircle, Clock, Target, Users, BookOpen, Briefcase, Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface GoalsOverviewProps {
  students: Student[];
}

const GoalsOverview: React.FC<GoalsOverviewProps> = ({ students }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate goal statistics
  const allGoals = students.flatMap(student => student.academicGoals);
  const completedGoals = allGoals.filter(goal => goal.status === 'Completed');
  const incompleteGoals = allGoals.filter(goal => goal.status === 'Incomplete');
  
  const goalsByCategory = allGoals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = { total: 0, completed: 0 };
    }
    acc[goal.category].total++;
    if (goal.status === 'Completed') {
      acc[goal.category].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const completionRate = allGoals.length > 0 ? Math.round((completedGoals.length / allGoals.length) * 100) : 0;

  // Recent goal completions with filtering and pagination
  const recentGoalCompletions = useMemo(() => {
    return students
      .flatMap(student => 
        student.academicGoals
          .filter(goal => goal.status === 'Completed' && goal.dateCompleted)
          .map(goal => ({ ...goal, studentName: student.name, studentAvatar: student.avatar }))
      )
      .filter(goal => {
        const matchesSearch = searchTerm === '' || 
          goal.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || goal.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || goal.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => new Date(b.dateCompleted!).getTime() - new Date(a.dateCompleted!).getTime());
  }, [students, searchTerm, selectedCategory, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(recentGoalCompletions.length / itemsPerPage);
  const paginatedGoals = recentGoalCompletions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ['All', 'Academic', 'Extracurricular', 'Career', 'Personal'];
  const statuses = ['All', 'Completed', 'Incomplete'];

  const categoryIcons = {
    'Academic': BookOpen,
    'Extracurricular': Users,
    'Career': Briefcase,
    'Personal': Heart
  };

  const categoryColors = {
    'Academic': 'bg-blue-500',
    'Extracurricular': 'bg-green-500',
    'Career': 'bg-purple-500',
    'Personal': 'bg-pink-500'
  };

  return (
    <div className="space-y-8">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>Total Students</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{students.length}</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>Completed Goals</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{completedGoals.length}</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>Incomplete Goals</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{incompleteGoals.length}</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>Completion Rate</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals by Category */}
      <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-6`}>Goals by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(goalsByCategory).map(([category, stats]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${categoryColors[category as keyof typeof categoryColors]} rounded-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{category}</p>
                    <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>{stats.completed}/{stats.total} completed</p>
                  </div>
                </div>
                <div className={`w-full ${isDark ? 'bg-dark-border' : 'bg-gray-200'} rounded-full h-2`}>
                  <div 
                    className={`${categoryColors[category as keyof typeof categoryColors]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>{progressPercentage}% complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Goal Activity */}
      <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4 sm:mb-0`}>Recent Goal Completions</h3>
          <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            Showing {paginatedGoals.length} of {recentGoalCompletions.length} goals
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-gray-400'} w-4 h-4`} />
            <input
              type="text"
              placeholder="Search goals or students..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
            ))}
          </select>
        </div>

        {/* Goals List */}
        <div className="space-y-3 mb-6">
          {paginatedGoals.length > 0 ? (
            paginatedGoals.map((goal, index) => (
              <div key={`${goal.studentName}-${goal.id}-${index}`} className={`flex items-center space-x-3 p-3 ${isDark ? 'bg-dark-background hover:bg-dark-border' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                <img 
                  src={goal.studentAvatar} 
                  alt={goal.studentName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'} truncate`}>
                    {goal.studentName} completed "{goal.title}"
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      goal.category === 'Academic' ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800') :
                      goal.category === 'Extracurricular' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') :
                      goal.category === 'Career' ? (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800') :
                      (isDark ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-800')
                    }`}>
                      {goal.category}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {new Date(goal.dateCompleted!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' 
                  ? 'No goals match your current filters' 
                  : 'No completed goals yet'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 text-sm font-medium ${isDark ? 'text-dark-muted bg-dark-card border-dark-border hover:bg-dark-border' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 text-sm font-medium ${isDark ? 'text-dark-muted bg-dark-card border-dark-border hover:bg-dark-border' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsOverview;
