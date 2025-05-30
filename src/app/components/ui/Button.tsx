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
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  let variantClasses = '';
  
  if (primary) {
    variantClasses = 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg focus:ring-blue-500';
  } else if (secondary) {
    variantClasses = 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 focus:ring-blue-500';
  } else if (outline) {
    variantClasses = 'bg-transparent border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500';
  } else {
    variantClasses = 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500';
  }
  
  const allClasses = `${baseClasses} ${variantClasses} ${className}`;
  
  return (
    <button className={allClasses} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}; 