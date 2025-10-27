import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Student } from '../../../../types/counselor';
import { CheckCircle, Clock, Target, Users, BookOpen, Briefcase, Heart, Search, ChevronLeft, ChevronRight, GraduationCap, Trophy, Building, User, Activity, Zap, Star, Award } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface GoalsOverviewProps {
  students: Student[];
}

const GoalsOverview: React.FC<GoalsOverviewProps> = ({ students }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Initialize filters from localStorage or defaults
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('goalsSearchTerm') || '';
    }
    return '';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('goalsSelectedCategory') || 'All';
    }
    return 'All';
  });
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('goalsSelectedStatus') || 'All';
    }
    return 'All';
  });
  const [displayedGoals, setDisplayedGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalGoals, setTotalGoals] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);
  
  const initialLoadSize = 50; // Load 50 goals initially
  const loadMoreSize = 10; // Load 10 more when scrolling
  
  // Ref for the Recent Goal Completions section
  const recentGoalsRef = useRef<HTMLDivElement>(null);

  // Save filters to localStorage
  const saveFiltersToStorage = useCallback((search: string, category: string, status: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('goalsSearchTerm', search);
      localStorage.setItem('goalsSelectedCategory', category);
      localStorage.setItem('goalsSelectedStatus', status);
    }
  }, []);

  // Apply local filters to data
  const applyLocalFilters = useCallback((data: any[]) => {
    return data.filter(goal => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          goal.title?.toLowerCase().includes(searchLower) ||
          goal.description?.toLowerCase().includes(searchLower) ||
          goal.studentName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory && selectedCategory !== 'All') {
        if (goal.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      
      // Status filter
      if (selectedStatus && selectedStatus !== 'All') {
        if (goal.status !== selectedStatus) {
          return false;
        }
      }
      
      return true;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Calculate goal statistics from all students
  const allGoalsFromStudents = students.flatMap(student => student.academicGoals);
  const completedGoals = allGoalsFromStudents.filter(goal => goal.status === 'Completed');
  const incompleteGoals = allGoalsFromStudents.filter(goal => goal.status === 'Incomplete');
  
  // Default categories that should always be displayed
  const defaultCategories = ['Academic', 'Extracurricular', 'Career', 'Personal'];
  
  const goalsByCategory = allGoalsFromStudents.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = { total: 0, completed: 0 };
    }
    acc[goal.category].total++;
    if (goal.status === 'Completed') {
      acc[goal.category].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);
  
  // Ensure all default categories are present with 0 values
  defaultCategories.forEach(category => {
    if (!goalsByCategory[category]) {
      goalsByCategory[category] = { total: 0, completed: 0 };
    }
  });

  const completionRate = allGoalsFromStudents.length > 0 ? Math.round((completedGoals.length / allGoalsFromStudents.length) * 100) : 0;

  // Function to load goals with cursor-based pagination
  // Load goals from API with pagination
  // Load goals with cursor-based pagination and local storage
  const loadGoals = useCallback(async (reset = false) => {
    if (loading) return;
    
    // Check localStorage for cached data on initial load
    if (reset && typeof window !== 'undefined') {
      const cacheKey = 'recentGoalsData';
      const cacheTimestampKey = 'recentGoalsTimestamp';
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
      
      if (cachedData && cachedTimestamp) {
        const now = Date.now();
        const cacheAge = now - parseInt(cachedTimestamp);
        
        if (cacheAge < cacheExpiry) {
          try {
            const parsed = JSON.parse(cachedData);
            
            // Apply local filtering first
            const localFiltered = applyLocalFilters(parsed.data || []);
            
            if (localFiltered.length >= initialLoadSize) {
              // We have enough local data
              setDisplayedGoals(localFiltered.slice(0, initialLoadSize));
              setLocalStorageData(parsed.data || []);
              setNextCursor(parsed.nextCursor);
              setTotalGoals(localFiltered.length);
              setHasMore(localFiltered.length > initialLoadSize);
              return;
            }
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        } else {
          // Cache expired, clear it
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(cacheTimestampKey);
        }
      }
    }
    
    setLoading(true);
    
    try {
      const limit = reset ? initialLoadSize : loadMoreSize;
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus
      });
      
      // Add cursor if not resetting
      if (!reset && nextCursor) {
        params.append('cursor', nextCursor);
      }
      
      const response = await fetch(`/api/counselor-goals?${params}`);
      if (!response.ok) {
        if (response.status === 503) {
          // Handle timeout error
          const errorData = await response.json();
          console.warn('Database timeout, retrying in 5 seconds...', errorData.message);
          setTimeout(() => loadGoals(reset), 5000);
          return;
        }
        throw new Error('Failed to fetch goals');
      }
      
      const data = await response.json();
      
      if (reset) {
        // Initial load - store in localStorage
        const allData = [...(localStorageData || []), ...data.goals];
        const uniqueData = allData.filter((goal, index, self) => 
          index === self.findIndex(g => g.id === goal.id)
        );
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('recentGoalsData', JSON.stringify({
            data: uniqueData,
            nextCursor: data.pagination.nextCursor
          }));
          localStorage.setItem('recentGoalsTimestamp', Date.now().toString());
        }
        
        setLocalStorageData(uniqueData);
        setDisplayedGoals(data.goals);
        setNextCursor(data.pagination.nextCursor);
      } else {
        // Load more - append to existing data
        const allData = [...localStorageData, ...data.goals];
        const uniqueData = allData.filter((goal, index, self) => 
          index === self.findIndex(g => g.id === goal.id)
        );
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('recentGoalsData', JSON.stringify({
            data: uniqueData,
            nextCursor: data.pagination.nextCursor
          }));
          localStorage.setItem('recentGoalsTimestamp', Date.now().toString());
        }
        
        setLocalStorageData(uniqueData);
        setDisplayedGoals(prev => [...prev, ...data.goals]);
        setNextCursor(data.pagination.nextCursor);
      }
      
      setHasMore(data.pagination.hasMore);
      setTotalGoals(data.pagination.totalGoals);
      
      // Scroll back to Recent Goal Completions section after filtering
      if (reset && recentGoalsRef.current) {
        setTimeout(() => {
          recentGoalsRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, loading, nextCursor, localStorageData]);

  // Load initial data
  useEffect(() => {
    loadGoals(true);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Cleanup localStorage when component unmounts (optional - keeps data for next visit)
  useEffect(() => {
    return () => {
      // Optionally clear localStorage on unmount
      // localStorage.removeItem('recentGoalsData');
    };
  }, []);

  // Load more data when scrolling
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadGoals(false);
    }
  }, [loading, hasMore, loadGoals]);

  // Scroll detection for infinite scroll within container
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
      loadGoals(false);
    }
  }, [loading, hasMore, loadGoals]);

  // Get unique categories from actual data
  const uniqueCategories = Array.from(new Set(allGoalsFromStudents.map(goal => goal.category))).sort();
  const categories = ['All', ...uniqueCategories];
  const statuses = ['All', 'Completed', 'Incomplete'];


  const categoryIcons = {
    'Academic': BookOpen,
    'Extracurricular': Users,
    'Career': Briefcase,
    'Personal': Heart,
    // Common variations
    'academic': BookOpen,
    'extracurricular': Users,
    'career': Briefcase,
    'personal': Heart,
    'Academic Goals': BookOpen,
    'Extracurricular Goals': Users,
    'Career Goals': Briefcase,
    'Personal Goals': Heart,
    'Education': GraduationCap,
    'Activities': Activity,
    'Professional': Building,
    'Life': User,
    'School': BookOpen,
    'Sports': Trophy,
    'Work': Briefcase,
    'Health': Heart,
    'Learning': BookOpen,
    'Social': Users,
    'Business': Building,
    'Wellness': Heart,
    'Study': BookOpen,
    'Team': Users,
    'Job': Briefcase,
    'Self': User,
    'College': GraduationCap,
    'Club': Users,
    'Internship': Briefcase,
    'Fitness': Activity,
    'Research': BookOpen,
    'Volunteer': Users,
    'Leadership': Award,
    'Hobby': Star
  };

  const categoryColors = {
    'Academic': 'bg-blue-500',
    'Extracurricular': 'bg-green-500',
    'Career': 'bg-purple-500',
    'Personal': 'bg-pink-500',
    // Common variations
    'academic': 'bg-blue-500',
    'extracurricular': 'bg-green-500',
    'career': 'bg-purple-500',
    'personal': 'bg-pink-500',
    'Academic Goals': 'bg-blue-500',
    'Extracurricular Goals': 'bg-green-500',
    'Career Goals': 'bg-purple-500',
    'Personal Goals': 'bg-pink-500',
    'Education': 'bg-indigo-500',
    'Activities': 'bg-emerald-500',
    'Professional': 'bg-violet-500',
    'Life': 'bg-rose-500',
    'School': 'bg-blue-500',
    'Sports': 'bg-orange-500',
    'Work': 'bg-purple-500',
    'Health': 'bg-red-500',
    'Learning': 'bg-blue-500',
    'Social': 'bg-green-500',
    'Business': 'bg-purple-500',
    'Wellness': 'bg-pink-500',
    'Study': 'bg-blue-500',
    'Team': 'bg-green-500',
    'Job': 'bg-purple-500',
    'Self': 'bg-pink-500',
    'College': 'bg-indigo-500',
    'Club': 'bg-green-500',
    'Internship': 'bg-purple-500',
    'Fitness': 'bg-orange-500',
    'Research': 'bg-blue-500',
    'Volunteer': 'bg-green-500',
    'Leadership': 'bg-yellow-500',
    'Hobby': 'bg-pink-500'
  };

  // Function to capitalize first letter of category
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Function to get light background colors matching Student Readiness Overview style
  const getLightColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('academic') || categoryLower.includes('education') || categoryLower.includes('school') || categoryLower.includes('learning') || categoryLower.includes('study') || categoryLower.includes('research')) {
      return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
    }
    if (categoryLower.includes('extracurricular') || categoryLower.includes('activities') || categoryLower.includes('social') || categoryLower.includes('team') || categoryLower.includes('club') || categoryLower.includes('volunteer')) {
      return isDark ? 'bg-green-900/30' : 'bg-green-100';
    }
    if (categoryLower.includes('career') || categoryLower.includes('professional') || categoryLower.includes('work') || categoryLower.includes('business') || categoryLower.includes('job') || categoryLower.includes('internship')) {
      return isDark ? 'bg-purple-900/30' : 'bg-purple-100';
    }
    if (categoryLower.includes('personal') || categoryLower.includes('life') || categoryLower.includes('wellness') || categoryLower.includes('self') || categoryLower.includes('hobby')) {
      return isDark ? 'bg-pink-900/30' : 'bg-pink-100';
    }
    if (categoryLower.includes('sports') || categoryLower.includes('fitness') || categoryLower.includes('leadership')) {
      return isDark ? 'bg-orange-900/30' : 'bg-orange-100';
    }
    if (categoryLower.includes('health')) {
      return isDark ? 'bg-red-900/30' : 'bg-red-100';
    }
    
    // Default fallback
    return isDark ? 'bg-gray-900/30' : 'bg-gray-100';
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
          {Object.entries(goalsByCategory)
            .sort(([catA], [catB]) => {
              // Sort default categories first
              const indexA = defaultCategories.indexOf(catA);
              const indexB = defaultCategories.indexOf(catB);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return catA.localeCompare(catB);
            })
            .map(([category, stats]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            // Use the specific icon or fallback to Target
            const DisplayIcon = IconComponent || Target;
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`${getLightColor(category)} p-3 rounded-lg flex-shrink-0`}>
                    <DisplayIcon className={`w-5 h-5 ${isDark ? 'text-dark-text' : 'text-gray-700'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{capitalizeFirstLetter(category)}</p>
                    <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>{stats.completed}/{stats.total} completed</p>
                  </div>
                </div>
                <div className={`w-full ${isDark ? 'bg-dark-border' : 'bg-gray-200'} rounded-full h-2`}>
                  <div 
                    className={`${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500 ease-out`}
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
      <div ref={recentGoalsRef} className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4 sm:mb-0`}>Recent Goal Activity</h3>
          <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            {/* No text shown */}
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-gray-400'} w-4 h-4`} />
            <input
              type="text"
              placeholder="Search goals, descriptions, or students (e.g., 'John', 'Math', 'Complete')..."
              value={searchTerm}
              onChange={(e) => {
                const newSearchTerm = e.target.value;
                setSearchTerm(newSearchTerm);
                saveFiltersToStorage(newSearchTerm, selectedCategory, selectedStatus);
                setDisplayedGoals([]);
                setHasMore(true);
                setNextCursor(null);
              }}
              className={`w-full pl-10 pr-10 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  saveFiltersToStorage('', selectedCategory, selectedStatus);
                  setDisplayedGoals([]);
                  setHasMore(true);
                }}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-gray-400 hover:text-gray-600'} w-4 h-4`}
              >
                ×
              </button>
            )}
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              const newCategory = e.target.value;
              setSelectedCategory(newCategory);
              saveFiltersToStorage(searchTerm, newCategory, selectedStatus);
              setDisplayedGoals([]);
              setHasMore(true);
            }}
            className={`px-3 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : capitalizeFirstLetter(category)}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              const newStatus = e.target.value;
              setSelectedStatus(newStatus);
              saveFiltersToStorage(searchTerm, selectedCategory, newStatus);
              setDisplayedGoals([]);
              setHasMore(true);
            }}
            className={`px-3 py-2 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
            ))}
          </select>
        </div>

        {/* Goals List - Fixed Height Scrollable Container */}
        <div 
          className="space-y-3 mb-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
          onScroll={handleScroll}
        >
          {displayedGoals.length > 0 ? (
            displayedGoals.map((goal, index) => (
              <div key={`${goal.studentName}-${goal.id}-${index}`} className={`flex items-center space-x-3 p-3 ${isDark ? 'bg-dark-background hover:bg-dark-border' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                <img 
                  src={goal.studentAvatar} 
                  alt={goal.studentName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'} truncate`}>
                    {goal.studentName} {goal.status === 'Completed' ? 'completed' : 'has'} "{goal.title}"
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      goal.status === 'Completed' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') :
                      (isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800')
                    }`}>
                      {goal.status}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {goal.dateCompleted ? 
                        `Completed: ${new Date(goal.dateCompleted).toLocaleDateString()}` :
                        `Created: ${new Date(goal.dateCreated).toLocaleDateString()}`
                      }
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
                  : ''
                }
              </p>
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-4">
              <div className={`inline-flex items-center ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Loading more goals...
            </div>
            </div>
          )}
          </div>

      </div>
    </div>
  );
};

export default GoalsOverview;
