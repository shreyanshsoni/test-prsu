'use client';

import React, { useState } from 'react';
import { Search, BookmarkCheck, CheckSquare, LayoutDashboard, Target, Route, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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
        className={`h-screen bg-white text-gray-700 flex flex-col fixed lg:relative z-20
          ${isOpen ? 'block' : 'hidden lg:block'} 
          ${isCollapsed ? 'lg:w-24' : 'lg:w-64'} 
          transition-all duration-500 ease-in-out overflow-hidden shadow-[2px_0px_10px_rgba(0,0,0,0.1)]`}
        style={{
          width: isOpen ? (isCollapsed ? '6rem' : '16rem') : isCollapsed ? '6rem' : '16rem',
          transition: 'width 0.5s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Logo section with toggle button on right */}
        <div className="p-4 flex items-center justify-center border-b border-gray-200 relative">
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
            className={`absolute ${isCollapsed ? 'right-2 top-1/2 -translate-y-1/2' : 'right-3 top-1/2 -translate-y-1/2'} p-1.5 text-gray-300 hover:text-gray-500 transition-all duration-300 flex items-center justify-center`}
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
                <button
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''} py-3 px-4 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? tab.label : undefined}
                >
                  <tab.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                  } transition-all duration-500`} />
                  {!isCollapsed && <span className="text-sm transition-opacity duration-500">{tab.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button at bottom */}
        <div className="sticky bottom-0 w-full p-4 border-t border-gray-200 bg-white transition-all duration-500 ease-in-out">
          <a
            href="/api/auth/logout"
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} py-3 px-4 text-red-600 hover:text-white rounded-lg transition-all duration-300 hover:bg-red-600`}
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
          className="p-2 bg-white rounded-md shadow-md text-gray-700 hover:bg-gray-100"
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