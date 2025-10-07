import React, { useEffect, useState } from 'react';
import { User, Filter, TrendingUp, Sparkles } from 'lucide-react';

const pillars = [
  {
    id: 1,
    icon: User,
    title: "Personalization",
    description: "Your roadmap adapts to your goals, interests, and stage.",
    detail: "Every student's journey is unique. Our AI-powered platform learns from your preferences, academic performance, and career aspirations to create a truly personalized experience.",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100"
  },
  {
    id: 2,
    icon: Filter,
    title: "Curation",
    description: "We surface programs and resources that match your journey.",
    detail: "Skip the endless searching. Our expert team curates thousands of opportunities, scholarships, and programs, showing you only what's relevant to your path.",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100"
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Progress",
    description: "Track your growth visually with goals, checklists, and wins.",
    detail: "See how far you've come and where you're headed. Our visual progress tracking keeps you motivated and helps you celebrate every milestone.",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100"
  }
];

const ValuePillars = () => {
  const [inView, setInView] = useState(false);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('value-pillars-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="value-pillars-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Why PRSU Works
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built for Your <span className="text-blue-600">Success</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
            We've designed every feature with one goal in mind: helping you transform your ambitions 
            into concrete achievements through personalized guidance and support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const delay = index * 0.2;
            
            return (
              <div
                key={pillar.id}
                className={`group transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${delay}s` }}
                onMouseEnter={() => setActivePillar(pillar.id)}
                onMouseLeave={() => setActivePillar(null)}
              >
                <div className="relative h-full">
                  {/* Card */}
                  <div className={`relative bg-gradient-to-br ${pillar.bgColor} rounded-3xl p-8 h-full transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl cursor-pointer`}>
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {pillar.title}
                    </h3>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                    
                    {/* Expandable Detail */}
                    <div className={`transition-all duration-500 overflow-hidden ${
                      activePillar === pillar.id ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {pillar.detail}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Indicator */}
                    <div className={`absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transform transition-all duration-300 ${
                      activePillar === pillar.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 -z-10 blur-xl`}></div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ValuePillars;