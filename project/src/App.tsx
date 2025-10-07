import React from 'react';
import Hero from './components/Hero';
import PronunciationSection from './components/PronunciationSection';
import InteractiveRoadmap from './components/InteractiveRoadmap';
import StudentJourney from './components/StudentJourney';
import ValuePillars from './components/ValuePillars';
import FinalCTA from './components/FinalCTA';
import FAQSection from './components/FAQSection';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <PronunciationSection />
      <InteractiveRoadmap />
      <StudentJourney />
      <ValuePillars />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}

export default App;