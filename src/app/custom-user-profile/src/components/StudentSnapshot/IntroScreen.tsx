import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface IntroScreenProps {
  onStart: () => void;
  onSkip: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onSkip }) => {
  const { theme } = useTheme();

  const slides = [
    {
      title: "Believe in Your Impact.",
      content: (
        <div className="space-y-6">
          <div className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 space-y-4 max-w-3xl mx-auto leading-relaxed">
            <p>Success isn't about being perfect. It's about caring deeply, dreaming boldly, and taking intentional steps towards your goals.</p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold">You already have what it takes.</p>
          </div>

          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 space-y-4 max-w-2xl mx-auto leading-relaxed">
            <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">Now let's show the world who you are—one roadmap at a time.</p>
          </div>
        </div>
      )
    }
  ];


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


        {/* Slide Content */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
            {slides[0].title}
          </h1>
          {slides[0].content}
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