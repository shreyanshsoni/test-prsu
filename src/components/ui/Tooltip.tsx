'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useTheme } from '../../app/contexts/ThemeContext';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = '',
  position = 'top',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { theme } = useTheme();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay to allow moving to tooltip
  };

  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 12;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 12;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 12;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 12;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 16) left = 16;
    if (left + tooltipRect.width > viewportWidth - 16) {
      left = viewportWidth - tooltipRect.width - 16;
    }
    if (top < 16) top = 16;
    if (top + tooltipRect.height > viewportHeight - 16) {
      top = viewportHeight - tooltipRect.height - 16;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      const handleResize = () => updateTooltipPosition();
      const handleScroll = () => updateTooltipPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    } else if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children || (
        <button
          className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full text-blue-600 dark:text-blue-400 transition-colors"
          aria-label="More information"
        >
          <Info className="w-4 h-4" />
        </button>
      )}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          className="fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          role="tooltip"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={hideTooltip}
        >
          <div className="text-left">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {content}
            </p>
          </div>
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 rotate-180' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -rotate-90' :
              'right-full top-1/2 transform -translate-y-1/2 rotate-90'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
