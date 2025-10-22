import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { CheckCircle, Clock, Target, Users, BookOpen, Briefcase, Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface GoalsOverviewProps {
  students: Student[];
}

const GoalsOverview: React.FC<GoalsOverviewProps> = ({ students }) => {
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGoals = recentGoalCompletions.slice(startIndex, startIndex + itemsPerPage);

  const categoryIcons = {
    Academic: BookOpen,
    Extracurricular: Users,
    Career: Briefcase,
    Personal: Heart
  };

  const categoryColors = {
    Academic: 'bg-blue-500',
    Extracurricular: 'bg-green-500',
    Career: 'bg-purple-500',
    Personal: 'bg-pink-500'
  };

  const categories = ['All', 'Academic', 'Extracurricular', 'Career', 'Personal'];
  const statuses = ['All', 'Completed', 'Incomplete'];

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
              <p className="text-sm text-gray-500">Goals Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incompleteGoals.length}</p>
              <p className="text-sm text-gray-500">Goals In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals by Category */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(goalsByCategory).map(([category, stats]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            return (
              <div key={category} className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{category}</h4>
                    <span className="text-sm text-gray-600">
                      {stats.completed}/{stats.total} ({completionPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${categoryColors[category as keyof typeof categoryColors]} h-2 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Goal Activity with Search and Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Recent Goal Activity</h3>
          <div className="text-sm text-gray-500">
            Showing {paginatedGoals.length} of {recentGoalCompletions.length} goals
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students or goals..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category} Goals</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div key={`${goal.studentName}-${goal.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img 
                  src={goal.studentAvatar} 
                  alt={goal.studentName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {goal.studentName} completed "{goal.title}"
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      goal.category === 'Academic' ? 'bg-blue-100 text-blue-800' :
                      goal.category === 'Extracurricular' ? 'bg-green-100 text-green-800' :
                      goal.category === 'Career' ? 'bg-purple-100 text-purple-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {goal.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(goal.dateCompleted!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
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
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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