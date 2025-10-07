import React, { useEffect, useState } from 'react';
import { Volume2, Play } from 'lucide-react';

const PronunciationSection = () => {
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('pronunciation-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handlePlayPronunciation = () => {
    setIsPlaying(true);
    // Simulate audio playback
    setTimeout(() => setIsPlaying(false), 1500);
  };

  return (
    <section id="pronunciation-section" className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex items-center gap-4 px-8 py-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white text-lg">P</span>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  PRSU
                </div>
                <div className="text-sm text-gray-500">
                  pronounced
                </div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  "per-SUE"
                </div>
                <div className="text-sm text-gray-500">
                  /pərˈsu/
                </div>
              </div>
              
              <button
                onClick={handlePlayPronunciation}
                className={`w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isPlaying ? 'animate-pulse bg-blue-200' : ''
                }`}
                aria-label="Play pronunciation"
              >
                {isPlaying ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <Play className="w-5 h-5 text-blue-600 ml-0.5" />
                )}
              </button>
            </div>
          </div>
          
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Just like "pursue" — because that's exactly what we help you do: chase your goals with purpose.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PronunciationSection;