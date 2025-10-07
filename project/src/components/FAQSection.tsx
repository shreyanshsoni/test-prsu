import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: "What is PRSU?",
    answer: "PRSU is a planning platform that helps students design their academic and career journey through a visual roadmap. It brings together curated opportunities, personalized prompts, and goal tracking to support better planning—on your own terms."
  },
  {
    id: 2,
    question: "Who is PRSU for?",
    answer: "PRSU is built for high school and college students, especially those who haven't always had access to consistent advising, early exposure to opportunities, or clear guidance on what steps to take when."
  },
  {
    id: 3,
    question: "What makes PRSU different?",
    answer: "Visually designed for students: No cluttered dashboards or endless forms. Planning made personal: Set your goals, track your progress, and discover programs that match your interests. Curated and timely: See what matters when it matters—internships, scholarships, deadlines, and more."
  },
  {
    id: 4,
    question: "What kinds of opportunities are on PRSU?",
    answer: "We feature high-impact, vetted opportunities including internships, fellowships, summer programs, and college access initiatives. Our content is designed to meet students where they are—across academic, career, and personal growth pathways."
  },
  {
    id: 5,
    question: "Is PRSU free?",
    answer: "Yes, PRSU is currently free for students. We're focused on making this tool as accessible as possible while exploring partnerships with schools, nonprofits, and mission-aligned organizations to sustain and grow the platform."
  },
  {
    id: 6,
    question: "What does PRSU stand for?",
    answer: "Our platform is pronounced \"Pursue\" because we believe students deserve the tools to pursue a future that's aligned with their story, their goals, and their potential."
  }
];

const FAQSection = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('faq-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold mb-6">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Have <span className="text-blue-600">Questions?</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
            Find answers to common questions about PRSU and how it can help you achieve your goals.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const delay = index * 0.1;
            
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${delay}s` }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg pr-4">{faq.question}</h3>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                      expandedFAQ === faq.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ${
                  expandedFAQ === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            Still have questions? <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Contact us</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;