import React, { useState } from 'react';
import { Sparkles, ArrowRight, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface IntroScreenProps {
  onStart: () => void;
  onSkip: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onSkip }) => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const slides = [
    {
      title: "Believe in Your Impact.",
      content: (
        <div className="space-y-6">
          <div className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 space-y-4 max-w-3xl mx-auto leading-relaxed">
            <p>The best colleges and programs aren't looking for the "perfect" student.</p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold">They're looking for future world shakers.</p>
          </div>

          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 space-y-4 max-w-2xl mx-auto leading-relaxed">
            <p>People who <em className="text-blue-500 dark:text-blue-400 font-medium">believe in something</em> — and are putting in the work, even when no one's watching.</p>
            
            <p>Whether you're launching a big idea or quietly showing up for your community, your dedication speaks volumes.</p>
          </div>
        </div>
      )
    },
    {
      title: "Your Story Matters.",
      content: (
        <div className="space-y-6">
          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 space-y-4 max-w-2xl mx-auto leading-relaxed">
            <p>It doesn't matter how niche your passion is.<br />
            <span className="text-blue-500 dark:text-blue-400 font-medium">What matters is that it's real.</span></p>
            
            <p className="text-2xl font-semibold text-gray-800 dark:text-white pt-4">You already have what it takes.</p>
            
            <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">Now let's show the world who you are.</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div 
      style={theme === 'dark' ? {backgroundColor: 'transparent'} : {}} 
      className={`min-h-screen ${
        theme !== 'dark' ? 'bg-gradient-to-br from-white via-blue-50 to-blue-100' : ''
      } flex items-center justify-center px-4 relative`}
    >
      {/* Background Animation - Only show in light mode */}
      {theme === 'light' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-8 shadow-2xl">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentSlide + 1} of {slides.length}
          </span>
          <div className="flex space-x-2 ml-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
          
          {/* Why This Matters Tooltip */}
          <div className="relative ml-4">
            <button
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
              onClick={() => setIsTooltipVisible(!isTooltipVisible)}
              className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full text-blue-600 dark:text-blue-400 transition-colors"
              aria-label="Why this matters"
            >
              <Info className="w-4 h-4" />
            </button>
            
            {isTooltipVisible && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                <div className="text-left">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm">Why This Matters</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    You'll be able to use this profile when applying to programs, scholarships, and internships. 
                    It's not about being impressive — it's about being intentional.
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Content with Animation */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="space-y-6 mb-12">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  {slide.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              currentSlide === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              currentSlide === slides.length - 1
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <button
            onClick={onStart}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 hover:scale-105 transform min-h-[56px] min-w-[280px] justify-center"
          >
            Start Building My Story
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <div>
            <button
              onClick={onSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline transition-colors"
            >
              Remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};