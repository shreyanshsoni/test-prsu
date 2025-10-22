'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, Play } from 'lucide-react';

const PronunciationSection = () => {
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        console.log('Pronunciation section in view:', entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('pronunciation-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Create audio element for pronunciation
    const audioElement = new Audio();
    audioElement.src = '/audio/prsu-pronunciation.mp3';
    audioElement.preload = 'auto';
    audioElement.volume = 0.8;
    
    // Handle audio events
    const handleCanPlay = () => {
      console.log('Audio ready to play');
    };
    
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
    };
    
    const handleLoadStart = () => {
      console.log('Audio loading started');
    };
    
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('loadstart', handleLoadStart);
    
    setAudio(audioElement);

    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('loadstart', handleLoadStart);
      if (audioElement) {
        audioElement.pause();
        audioElement.remove();
      }
    };
  }, []);

  const handlePlayPronunciation = async () => {
    if (!audio) return;
    
    setIsPlaying(true);
    
    try {
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Try to play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Audio playing successfully');
        
        // Listen for when audio ends
        const handleEnded = () => {
          setIsPlaying(false);
          audio.removeEventListener('ended', handleEnded);
        };
        
        audio.addEventListener('ended', handleEnded);
        
      } else {
        // Fallback for older browsers
        setTimeout(() => setIsPlaying(false), 2000);
      }
      
    } catch (error) {
      console.log('Audio play failed, using text-to-speech fallback:', error);
      setIsPlaying(false);
      
      // Fallback to text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('per-SUE');
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        // If no TTS available, just show animation
    setTimeout(() => setIsPlaying(false), 1500);
      }
    }
  };

  return (
    <section id="pronunciation-section" className="py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/20 dark:to-gray-700/20 dark:backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center pronunciation-animate ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <img 
                  src="/P_Logo.png" 
                  alt="PRSU Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  PRSU
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  pronounced
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-px h-px sm:h-12 bg-gray-200 dark:bg-gray-600"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  "per-SUE"
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  /pərˈsu/
                </div>
              </div>
              
              <button
                onClick={handlePlayPronunciation}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isPlaying ? 'animate-pulse bg-blue-200 dark:bg-blue-800' : ''
                }`}
                aria-label="Play pronunciation"
              >
                {isPlaying ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 ml-0.5" />
                )}
              </button>
            </div>
          </div>
          
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Just like "pursue" — because that's exactly what we help you do: chase your goals with purpose.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PronunciationSection;