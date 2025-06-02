'use client';

import { Search, BookmarkCheck, CheckSquare, LogIn, LogOut, LayoutDashboard, Target, Route, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Program, ChecklistItem, AcademicYear } from './types/types';
import ProgramSearch from './components/ProgramSearch';
import SavedPrograms from './components/SavedPrograms';
import ApplicationChecklist from './components/ApplicationChecklist';
import { useAuth, UserProfile } from './hooks/useAuth';
import Link from 'next/link';
import ProfileAvatar from './components/ProfileAvatar';
import { fetchUserSavedPrograms, saveUserProgram, removeUserProgram } from './services/userProgramService';
import UserDashboard from './components/UserDashboard';
import AcademicGoals from './components/AcademicGoals';
import AcademicRoadmapPlanner from './components/AcademicRoadmapPlanner';
import toast from 'react-hot-toast';
import { createGoal, GoalInput, fetchGoals, Goal, toggleGoalCompletion } from './services/goalService';
import Sidebar from './components/Sidebar';
import { useTheme } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { StarryBackground } from './components/ui/StarryBackground';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Program Search', icon: Search },
  { id: 'saved', label: 'My Programs', icon: BookmarkCheck },
  { id: 'checklist', label: 'My Checklists', icon: CheckSquare },
  { id: 'goals', label: 'Academic Goals', icon: Target },
  { id: 'roadmapPlanner', label: 'Roadmap Planner', icon: Route },
] as const;

type TabId = typeof TABS[number]['id'];

interface HomeClientComponentProps {
  user?: UserProfile;
}

export default function HomeClientComponent({ 
  user: externalUser
}: HomeClientComponentProps) {
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false); // Track if the component is on the client
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    {
      year: 2024,
      milestones: [
        {
          id: '1',
          title: 'Complete SAT/ACT',
          description: 'Register and prepare for standardized tests',
          date: '2024-05-01',
          type: 'preparation',
          completed: false,
        },
        {
          id: '2',
          title: 'Research Summer Programs',
          description: 'Identify and apply to relevant summer enrichment programs',
          date: '2024-03-15',
          type: 'deadline',
          completed: false,
        },
      ],
    },
    {
      year: 2025,
      milestones: [
        {
          id: '3',
          title: 'College Applications',
          description: 'Begin college application process',
          date: '2025-01-01',
          type: 'deadline',
          completed: false,
        },
        {
          id: '4',
          title: 'AP Courses',
          description: 'Complete required AP courses for target programs',
          date: '2025-05-15',
          type: 'prerequisite',
          completed: false,
        },
      ],
    },
  ]);
  const [isLoadingUserPrograms, setIsLoadingUserPrograms] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false); // Add state for goal form
  const [academicGoals, setAcademicGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  // Track scroll position for navbar background
  const [scrolled, setScrolled] = useState(false);

  // Use passed user if available, fall back to auth hook user
  const user = externalUser || authUser;

  useEffect(() => {
    setIsClient(true); // Mark the component as client-side
  }, []);

  // Fetch user's saved programs when they login
  useEffect(() => {
    if (user && isClient) {
      loadUserSavedPrograms();
      loadUserGoals(); // Load user goals
    }
  }, [user, isClient]);

  // Load user's goals from the server
  const loadUserGoals = async () => {
    if (user) {
      try {
        setIsLoadingGoals(true);
        console.log('Starting to fetch user goals...');
        
        const goals = await fetchGoals();
        console.log(`Successfully loaded ${goals.length} goals`);
        
        setAcademicGoals(goals);
      } catch (error) {
        console.error('Error loading goals:', error);
        setAcademicGoals([]);
      } finally {
        setIsLoadingGoals(false);
      }
    } else {
      setAcademicGoals([]);
    }
  };

  // Load user's saved programs from the server
  const loadUserSavedPrograms = async () => {
    if (user) {
      try {
        setIsLoadingUserPrograms(true);
        console.log('Starting to fetch user saved programs...');
        
        // Set a timeout to avoid waiting indefinitely for the fetch
        const timeoutPromise = new Promise<Program[]>((_, reject) => {
          setTimeout(() => reject(new Error('Fetch timeout')), 30000);
        });
        
        // Race between the fetch and the timeout
        const programs = await Promise.race([
          fetchUserSavedPrograms(),
          timeoutPromise
        ]);
        
        console.log(`Successfully loaded ${programs.length} user programs`);
        setSavedPrograms(programs);
        
        // Create default checklist items for each program if none exist
        const newChecklistItems: ChecklistItem[] = [];
        
        programs.forEach(program => {
          // Only add checklist items if none exist for this program
          if (!checklist.some(item => item.programId === program.id)) {
            // Use more unique IDs by combining program ID with item type and a timestamp
            const timestamp = Date.now();
            newChecklistItems.push(
              {
                id: `${program.id}-transcript-${timestamp}`,
                title: 'Submit Official Transcript',
                status: 'not_started',
                deadline: program.deadline,
                programId: program.id,
                type: 'standard',
              },
              {
                id: `${program.id}-recommendations-${timestamp}`,
                title: 'Request Letters of Recommendation',
                status: 'not_started',
                deadline: program.deadline,
                programId: program.id,
                type: 'standard',
              },
              {
                id: `${program.id}-essay-${timestamp}`,
                title: 'Complete Application Essay',
                status: 'not_started',
                deadline: program.deadline,
                programId: program.id,
                type: 'program_specific',
              }
            );
          }
        });
        
        if (newChecklistItems.length > 0) {
          setChecklist(prev => [...prev, ...newChecklistItems]);
        }
      } catch (error) {
        console.error('Error loading user programs:', error);
        // Just continue with empty saved programs rather than breaking the whole app
        setSavedPrograms([]);
      } finally {
        setIsLoadingUserPrograms(false);
      }
    } else {
      // Clear saved programs when user logs out
      setSavedPrograms([]);
      setIsLoadingUserPrograms(false);
    }
  };

  const handleSaveProgram = async (program: Program) => {
    if (user) {
      // Save to server first
      const success = await saveUserProgram(program.id);
      
      if (success) {
        // Show toast notification
        toast.success('Program saved to My Programs', {
          position: 'bottom-right',
          duration: 3000,
          style: {
            background: '#4F46E5',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#4F46E5',
          },
        });
        
        // Then update local state
        setSavedPrograms(prev => {
          if (prev.some(p => p.id === program.id)) return prev;
          return [...prev, program];
        });
  
        // Create default checklist items for the program
        const newChecklistItems: ChecklistItem[] = [
          {
            id: `${program.id}-transcript-${Date.now()}`,
            title: 'Submit Official Transcript',
            status: 'not_started',
            deadline: program.deadline,
            programId: program.id,
            type: 'standard',
          },
          {
            id: `${program.id}-recommendations-${Date.now()}`,
            title: 'Request Letters of Recommendation',
            status: 'not_started',
            deadline: program.deadline,
            programId: program.id,
            type: 'standard',
          },
          {
            id: `${program.id}-essay-${Date.now()}`,
            title: 'Complete Application Essay',
            status: 'not_started',
            deadline: program.deadline,
            programId: program.id,
            type: 'program_specific',
          },
        ];
  
        setChecklist(prev => [...prev, ...newChecklistItems]);
      }
    } else {
      // Show toast notification for non-logged in users too
      toast.success('Program saved to My Programs', {
        position: 'bottom-right',
        duration: 3000,
        style: {
          background: '#4F46E5',
          color: '#ffffff',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#4F46E5',
        },
      });
      
      // Fallback for not logged in users - just use local state
      setSavedPrograms(prev => {
        if (prev.some(p => p.id === program.id)) return prev;
        return [...prev, program];
      });
      
      // Create default checklist items for the program
      const newChecklistItems: ChecklistItem[] = [
        {
          id: `${program.id}-transcript-${Date.now()}`,
          title: 'Submit Official Transcript',
          status: 'not_started',
          deadline: program.deadline,
          programId: program.id,
          type: 'standard',
        },
        {
          id: `${program.id}-recommendations-${Date.now()}`,
          title: 'Request Letters of Recommendation',
          status: 'not_started',
          deadline: program.deadline,
          programId: program.id,
          type: 'standard',
        },
        {
          id: `${program.id}-essay-${Date.now()}`,
          title: 'Complete Application Essay',
          status: 'not_started',
          deadline: program.deadline,
          programId: program.id,
          type: 'program_specific',
        },
      ];

      setChecklist(prev => [...prev, ...newChecklistItems]);
    }
  };

  const handleRemoveProgram = async (programId: string) => {
    if (user) {
      // Remove from server first
      const success = await removeUserProgram(programId);
      
      if (success) {
        // Show toast notification
        toast.success('Program removed from My Programs', {
          position: 'bottom-right',
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#EF4444',
          },
        });
        
        // Then update local state
        setSavedPrograms(prev => prev.filter(p => p.id !== programId));
        setChecklist(prev => prev.filter(item => item.programId !== programId));
      }
    } else {
      // Show toast notification for non-logged in users too
      toast.success('Program removed from My Programs', {
        position: 'bottom-right',
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#ffffff',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#EF4444',
        },
      });
      
      // Fallback for not logged in - just use local state
      setSavedPrograms(prev => prev.filter(p => p.id !== programId));
      setChecklist(prev => prev.filter(item => item.programId !== programId));
    }
  };

  // Update checklist item status
  const handleUpdateChecklistStatus = (itemId: string, status: ChecklistItem['status']) => {
    setChecklist(prev =>
      prev.map(item => item.id === itemId ? { ...item, status } : item)
    );
  };

  // Update academic years
  const handleUpdateAcademicYears = (years: AcademicYear[]) => {
    setAcademicYears(years);
    // Here you could also add API call to save the updated years to the backend
  };

  // Handle creating a goal directly from the dashboard
  const handleCreateGoal = async (goalData: GoalInput) => {
    try {
      const newGoal = await createGoal(goalData);
      
      if (newGoal) {
        // Add the new goal to the state
        setAcademicGoals(prevGoals => [...prevGoals, newGoal]);
        
        toast.success('Goal saved in Academic Goals', {
          position: 'bottom-right',
          duration: 3000,
        });
        return true;
      }
      
      toast.error('Failed to create goal');
      return false;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('An error occurred while saving the goal');
      return false;
    }
  };

  // Handle toggle goal completion
  const handleToggleGoalCompletion = async (goalId: string, currentCompleted: boolean) => {
    try {
      const updatedGoal = await toggleGoalCompletion(goalId, !currentCompleted);
      if (updatedGoal) {
        // Update the goals state
        setAcademicGoals(prevGoals => 
          prevGoals.map(goal => goal.id === goalId ? { ...goal, completed: !currentCompleted } : goal)
        );
        
        toast.success(`Goal ${!currentCompleted ? 'completed' : 'marked as incomplete'}`, {
          position: 'bottom-right',
          duration: 2000,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast.error('Failed to update goal status');
      return false;
    }
  };

  const handleCreateRoadmap = async (goalData: GoalInput) => {
    try {
      const newGoal = await createGoal(goalData);
      
      if (newGoal) {
        // Add the new goal to the state
        setAcademicGoals(prevGoals => [...prevGoals, newGoal]);
        
        toast.success('Goal saved in Academic Goals', {
          position: 'bottom-right',
          duration: 3000,
        });
        return true;
      }
      
      toast.error('Failed to create goal');
      return false;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('An error occurred while saving the goal');
      return false;
    }
  };

  // Handle switching to goals tab directly
  const handleSwitchToGoalsTab = () => {
    // Switch to the goals tab
    setActiveTab('goals');
  };

  // Handle switching to roadmap planner with modal open
  const handleSwitchToRoadmapPlannerWithModal = () => {
    // First switch to the roadmap planner tab
    setActiveTab('roadmapPlanner');
    
    // Use URL parameter to signal that the modal should be opened
    // This will be detected by the AcademicRoadmapPlanner component
    const url = new URL(window.location.href);
    url.searchParams.set('openCreateModal', 'true');
    window.history.pushState({}, '', url);
    
    // Force a re-render of the component
    setIsClient(false);
    setTimeout(() => setIsClient(true), 0);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Use effect to monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
      {/* Dashboard-specific starry background */}
      {theme === 'dark' && <StarryBackground />}
      
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Academic Planner",
            "description": "A modern, SEO-friendly Next.js app for managing academic programs, checklists, and roadmaps.",
            "url": "https://goprsu.com/",
            "image": "https://yourwebsite.com/og-image.png",
          }),
        }}
      />
      
      {user ? (
        // Layout with sidebar for logged-in users
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            user={user}
            isOpen={isMobileMenuOpen}
            onToggle={toggleMobileMenu}
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top navbar */}
            <header 
              className={`sticky top-0 z-10 transition-all duration-300 ${
                scrolled ? 'shadow-md dark:shadow-dark-border/30' : ''
              }`}
              style={{
                backgroundColor: scrolled 
                  ? theme === 'dark' 
                    ? 'rgba(15, 23, 42, 0.65)' 
                    : 'rgba(255, 255, 255, 0.65)'
                  : 'transparent',
                backdropFilter: scrolled ? 'blur(8px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
                borderBottom: scrolled 
                  ? theme === 'dark'
                    ? '1px solid rgba(30, 41, 59, 0.8)'
                    : '1px solid rgba(229, 231, 235, 0.8)' 
                  : 'none'
              }}
            >
              <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={toggleMobileMenu}
                    className="mr-4 lg:hidden text-light-text dark:text-dark-text"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  
                {/* User profile - avatar and name only */}
                {user && (
                  <Link href="/profile" className="flex items-center" aria-label="View profile">
                    <ProfileAvatar 
                      picture={user.picture}
                      name={user.sub?.includes('auth0') 
                        ? (user.nickname || user.name || user.email)
                        : user.name?.split(' ')[0]}
                      size="2rem"
                      className="mr-2"
                    />
                      <span className="text-sm font-medium text-light-text dark:text-dark-text hidden sm:inline">
                      {user.sub?.includes('auth0') 
                        ? (user.nickname || user.name || user.email) 
                        : user.name?.split(' ')[0]
                      }
                    </span>
                  </Link>
                )}
                </div>
              </div>
            </header>
            
            {/* Content area */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="max-w-6xl mx-auto">
                {/* Tab Content */}
                <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm dark:shadow-dark-border/30 p-6 mb-6">
                  {activeTab === 'dashboard' && (
                    <UserDashboard 
                      savedPrograms={savedPrograms}
                      checklist={checklist}
                      academicYears={academicYears}
                      onUpdateAcademicYears={handleUpdateAcademicYears}
                      onSwitchToRoadmapPlanner={handleSwitchToRoadmapPlannerWithModal}
                      onSwitchToGoalsTab={handleSwitchToGoalsTab}
                      onCreateGoal={handleCreateGoal}
                      academicGoals={academicGoals}
                      isLoadingGoals={isLoadingGoals}
                      onToggleGoalCompletion={handleToggleGoalCompletion}
                    />
                  )}
                  {activeTab === 'search' && (
                    <ProgramSearch
                      onSaveProgram={handleSaveProgram}
                      savedPrograms={savedPrograms}
                      isAuthenticated={!!user}
                    />
                  )}
                  {activeTab === 'saved' && (
                    <>
                      {isLoadingUserPrograms ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
                        </div>
                      ) : (
                        <SavedPrograms
                          programs={savedPrograms}
                          onRemoveProgram={handleRemoveProgram}
                        />
                      )}
                    </>
                  )}
                  {activeTab === 'checklist' && (
                    <ApplicationChecklist
                      checklist={checklist}
                      programs={savedPrograms}
                      onUpdateStatus={handleUpdateChecklistStatus}
                    />
                  )}
                  {activeTab === 'goals' && (
                    <div>
                      <AcademicGoals 
                        initialShowForm={showGoalForm} 
                        onFormClose={() => setShowGoalForm(false)} 
                        onGoalCreated={(newGoal) => {
                          setAcademicGoals(prev => [...prev, newGoal]);
                        }}
                        onGoalUpdated={(updatedGoal) => {
                          setAcademicGoals(prev => 
                            prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
                          );
                        }}
                        onGoalDeleted={(deletedGoalId) => {
                          setAcademicGoals(prev => 
                            prev.filter(goal => goal.id !== deletedGoalId)
                          );
                        }}
                      />
                    </div>
                  )}
                  {activeTab === 'roadmapPlanner' && (
                    <section>
                      <AcademicRoadmapPlanner />
                    </section>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        // Original layout for non-logged in users
        <>
          {/* Add the new design link in the navigation */}
          <nav className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <a href="/?tab=search">
                    <img 
                      src="/fulllogo_transparent_nobuffer.png" 
                      alt="PRSU" 
                      className="ml-2 h-14 object-contain"
                    />
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  
                  <div className="ml-auto flex items-center">
                    <div className="md:flex items-center gap-5 hidden">
                      <a
                        href="/api/auth/login"
                        className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                      >
                        <div className="flex items-center gap-1">
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content for non-logged in users */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-light-text dark:text-dark-text mb-2">
                Please sign in to view your saved programs
              </h3>
              <p className="text-light-muted dark:text-dark-muted mb-4">
                Login to access your personalized academic planning dashboard
              </p>
              <Link
                href="/api/auth/login/"
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}