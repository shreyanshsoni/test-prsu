import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, GraduationCap as Graduation } from 'lucide-react';

const journeySteps = [
  {
    id: 1,
    grade: "10th Grade",
    title: "Local Coding Bootcamp",
    description: "Samantha discovers her passion for programming through PRSU's curated summer program recommendations.",
    icon: Calendar,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    grade: "11th Grade", 
    title: "First Internship + Volunteer Project",
    description: "She lands a tech internship and starts a coding club at her school.",
    icon: MapPin,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: 3,
    grade: "12th Grade",
    title: "College Applications",
    description: "PRSU tracks her deadlines and she gets into her dream computer science program.",
    icon: Trophy,
    color: "from-green-500 to-green-600"
  },
  {
    id: 4,
    grade: "College",
    title: "Future Success",
    description: "Now at university, Samantha continues to use PRSU to plan her career path.",
    icon: Graduation,
    color: "from-orange-500 to-orange-600"
  }
];

const StudentJourney = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('journey-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % journeySteps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <section id="journey-section" className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            From Ambition to <span className="text-blue-400">Achievement</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed">
            Follow Samantha's journey as she transforms from an uncertain 10th grader 
            to a confident college student, all with PRSU as her guide.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Container */}
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Story Content */}
            <div className="lg:w-1/2 space-y-8">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                
                return (
                  <div
                    key={step.id}
                    className={`relative transition-all duration-700 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-start gap-6 cursor-pointer group">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center transform transition-all duration-300 ${
                        isActive ? 'scale-110 shadow-xl' : 'scale-100 shadow-lg'
                      } group-hover:scale-110`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-blue-400">{step.grade}</span>
                          <div className="h-px bg-gray-700 flex-1"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Connection Line */}
                    {index < journeySteps.length - 1 && (
                      <div className="absolute left-8 top-16 w-px h-16 bg-gradient-to-b from-gray-600 to-transparent"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Visual Representation */}
            <div className="lg:w-1/2">
              <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                {/* Content Overlay */}
                <div className="text-center p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                        {journeySteps[activeStep].grade}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {journeySteps[activeStep].title}
                    </h3>
                    <p className="text-gray-200 leading-relaxed">
                      {journeySteps[activeStep].description}
                    </p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute top-6 right-6 flex gap-2">
                  {journeySteps.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        activeStep === index ? 'bg-blue-400 scale-125' : 'bg-gray-500'
                      }`}
                      onClick={() => setActiveStep(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Start Your Story
              <Trophy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentJourney;