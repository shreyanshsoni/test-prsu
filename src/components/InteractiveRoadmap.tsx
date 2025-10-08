'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Briefcase, Target, Map } from 'lucide-react';

const roadmapNodes = [
  {
    id: 1,
    icon: Map,
    title: "Academic Roadmap",
    description: "Build your personalized path from where you are to where you want to be",
    color: "from-purple-500 to-purple-600",
    position: { x: 15, y: 35 }
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Summer Programs",
    description: "Discover enriching programs that match your interests",
    color: "from-blue-500 to-blue-600",
    position: { x: 40, y: 25 }
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Internships",
    description: "Land meaningful work experience opportunities",
    color: "from-green-500 to-green-600",
    position: { x: 65, y: 55 }
  },
  {
    id: 4,
    icon: Target,
    title: "Academic Goals",
    description: "Set and track your educational milestones",
    color: "from-orange-500 to-orange-600",
    position: { x: 85, y: 35 }
  }
];

const InteractiveRoadmap = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        console.log('Roadmap section in view:', entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('roadmap-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Handle animation state
  useEffect(() => {
    if (inView) {
      setIsAnimating(true);
    } else {
      // Add a small delay before starting reverse animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section id="roadmap-section" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Journey, <span className="text-blue-600 dark:text-blue-400">Visualized</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Watch your path unfold as you explore opportunities, set goals, and track your progress 
            on a personalized roadmap designed just for you.
          </p>
        </div>

        <div className="relative">
          {/* Clean Roadmap Container */}
          <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-blue-900 dark:to-purple-900 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="roadmapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="currentColor" className="text-blue-600"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#roadmapGrid)" />
              </svg>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-8 sm:inset-12 md:inset-16 w-auto h-auto" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {roadmapNodes.slice(0, -1).map((node, index) => {
                const nextNode = roadmapNodes[index + 1];
                const delay = index * 0.2;
                const reverseDelay = (roadmapNodes.length - 2 - index) * 0.15;
                
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={nextNode.position.x}
                    y2={nextNode.position.y}
                    stroke="url(#pathGradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className={`svg-line-animate ${
                      isAnimating ? 'opacity-100 draw-line' : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isAnimating ? `${delay}s` : '0s',
                      strokeDashoffset: isAnimating ? '0' : '100',
                      transition: isAnimating 
                        ? `opacity 1s ease-in-out ${delay}s, stroke-dashoffset 1s ease-in-out ${delay}s`
                        : `opacity 0.8s ease-in-out, stroke-dashoffset 0.8s ease-in-out ${reverseDelay}s`
                    }}
                  />
                );
              })}
            </svg>

            {/* Roadmap Nodes with Cards */}
            {roadmapNodes.map((node, index) => {
              const Icon = node.icon;
              const delay = index * 0.15;
              
              return (
                <React.Fragment
                  key={node.id}
                >
                  {/* Node Circle */}
                  <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                      inView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{
                      left: `${node.position.x}%`,
                      top: `${node.position.y}%`,
                      transitionDelay: `${delay}s`
                    }}
                  >
                    <div className="relative group cursor-pointer" onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}>
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${node.color} shadow-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl z-10 relative`}>
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                      </div>
                      
                      {/* Pulse Animation */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${node.color} opacity-30 animate-ping group-hover:animate-none`}></div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile-Friendly Cards Below */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roadmapNodes.map((node, index) => {
              const Icon = node.icon;
              const delay = index * 0.1;
              
              return (
                <div
                  key={`card-${node.id}`}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-700 hover:shadow-xl hover:scale-105 cursor-pointer ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  } ${activeNode === node.id ? 'ring-2 ring-blue-500 shadow-blue-100 dark:shadow-blue-900' : ''}`}
                  style={{ transitionDelay: `${delay + 0.5}s` }}
                  onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{node.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{node.description}</p>
                  
                  {/* Expanded Content */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    activeNode === node.id ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to explore this step in your journey and discover what opportunities await.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <a 
              href="/api/auth/login"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
            >
              Explore Your Roadmap
              <Target className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveRoadmap;