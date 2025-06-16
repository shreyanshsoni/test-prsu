'use client';

import React, { useState } from 'react';
import { Search, BookmarkCheck, CheckSquare, LayoutDashboard, Target, Route, LogOut, ChevronLeft, ChevronRight, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '../hooks/useAuth';
import ProfileAvatar from './ProfileAvatar';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user: UserProfile | null;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  user,
  isOpen,
  onToggle
}) => {
  // Default to expanded sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prevState => !prevState);
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Program Search', icon: Search },
    { id: 'saved', label: 'My Programs', icon: BookmarkCheck },
    { id: 'checklist', label: 'My Checklists', icon: CheckSquare },
    { id: 'goals', label: 'Academic Goals', icon: Target },
    { id: 'roadmapPlanner', label: 'Roadmap Planner', icon: Route },
    { id: 'customUserProfile', label: 'User Profile', icon: User },
  ];

  if (!user) return null;

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // Close mobile menu when selecting a tab on mobile
    if (isOpen && window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div 
        className={`h-screen bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text flex flex-col fixed lg:relative z-20
          ${isOpen ? 'block' : 'hidden lg:block'} 
          ${isCollapsed ? 'lg:w-24' : 'lg:w-64'} 
          shadow-[2px_0px_10px_rgba(0,0,0,0.1)] dark:shadow-[2px_0px_10px_rgba(0,0,0,0.3)] overflow-hidden`}
        style={{
          width: isOpen ? (isCollapsed ? '6rem' : '16rem') : isCollapsed ? '6rem' : '16rem',
          transition: 'width 0.5s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Logo section with toggle button on right */}
        <div className="p-4 flex items-center justify-center border-b border-light-border dark:border-dark-border relative">
          <a href="/?tab=dashboard" onClick={() => handleTabChange('dashboard')} className={`${isCollapsed ? 'mx-auto flex justify-center' : 'mx-auto'} transition-all duration-500 ease-in-out`}>
            {isCollapsed ? (
              <img 
                src="/P_Logo.png" 
                alt="P" 
                className="h-10 w-10 object-contain transition-all duration-500 ease-in-out"
              />
            ) : (
              <img 
                src="/fulllogo_transparent_nobuffer.png" 
                alt="PRSU" 
                className="h-12 object-contain transition-all duration-500 ease-in-out"
              />
            )}
          </a>
          
          {/* Toggle button positioned on the right with changing chevron direction */}
          <button 
            className={`absolute ${isCollapsed ? 'right-2 top-1/2 -translate-y-1/2' : 'right-3 top-1/2 -translate-y-1/2'} p-1.5 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-all duration-300 flex items-center justify-center`}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-4 transition-all duration-500 ease-in-out">
          <ul className="space-y-2">
            {TABS.map((tab) => (
              <li key={tab.id} className={`${isCollapsed ? 'px-2' : 'px-4'} transition-all duration-500 ease-in-out`}>
                {tab.id === 'customUserProfile' ? (
                  <Link
                    href="/custom-user-profile"
                    className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''} py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                    }`}
                    title={isCollapsed ? tab.label : undefined}
                  >
                    <tab.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} ${
                      activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : 'text-light-muted dark:text-dark-muted'
                    } transition-all duration-500`} />
                    {!isCollapsed && <span className="text-sm transition-opacity duration-500">{tab.label}</span>}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''} py-3 px-4 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                    }`}
                    title={isCollapsed ? tab.label : undefined}
                  >
                    <tab.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} ${
                      activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : 'text-light-muted dark:text-dark-muted'
                    } transition-all duration-500`} />
                    {!isCollapsed && <span className="text-sm transition-opacity duration-500">{tab.label}</span>}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button at bottom */}
        <div className="sticky bottom-0 w-full p-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card transition-all duration-500 ease-in-out">
          <a
            href="/api/auth/logout"
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} py-3 px-4 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white rounded-lg transition-all duration-300 hover:bg-red-600 dark:hover:bg-red-700`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} transition-all duration-500`} />
            {!isCollapsed && <span className="text-sm transition-opacity duration-500">Logout</span>}
          </a>
        </div>
      </div>
      
      {/* Mobile menu button - only visible on mobile */}
      <div className="fixed top-4 left-4 z-30 hidden">
        <button 
          onClick={onToggle}
          className="p-2 bg-light-card dark:bg-dark-card rounded-md shadow-md text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={24} />
        </button>
      </div>
      
      {/* Overlay for mobile menu backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar; 