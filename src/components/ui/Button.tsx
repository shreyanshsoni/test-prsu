'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  secondary?: boolean;
  outline?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  primary, 
  secondary, 
  outline,
  children, 
  className = '',
  icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-offset-dark-background';
  
  let variantClasses = '';
  
  if (primary) {
    variantClasses = 'bg-gradient-to-r from-primary-700 to-primary-600 text-white hover:from-primary-800 hover:to-primary-700 shadow-md hover:shadow-lg focus:ring-primary-500 dark:from-primary-600 dark:to-primary-500 dark:hover:from-primary-700 dark:hover:to-primary-600';
  } else if (secondary) {
    variantClasses = 'bg-light-card dark:bg-dark-card text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:border-primary-300 dark:hover:border-primary-700 focus:ring-primary-500';
  } else if (outline) {
    variantClasses = 'bg-transparent border border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 focus:ring-primary-500';
  } else {
    variantClasses = 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border focus:ring-primary-500';
  }
  
  const allClasses = `${baseClasses} ${variantClasses} ${className}`;
  
  return (
    <button className={allClasses} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}; 