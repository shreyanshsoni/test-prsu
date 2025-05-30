'use client';

import { useEffect, useState } from 'react';
import { Program } from '../types/types';
import { Calendar, MapPin, GraduationCap, DollarSign } from 'lucide-react';
import { animated } from '@react-spring/web';
import type { AnimatedComponent } from '@react-spring/web';
import Image from 'next/image'; // Use Next.js Image component
import { formatDate } from '../utils/dateUtils';

interface ProgramCardProps {
  program: Program;
  style?: React.CSSProperties & {
    rot?: number;
    x?: number;
    opacity?: number;
  };
  isSwipeMode?: boolean; // Add new prop to indicate swipe mode
  // Add additional props for bind
  [key: string]: any;
}

const AnimatedDiv = animated.div as AnimatedComponent<'div'>;

export default function ProgramCard({ program, style, isSwipeMode = false, ...props }: ProgramCardProps) {
  const [formattedDeadline, setFormattedDeadline] = useState(formatDate(program.deadline));
  const [isMounted, setIsMounted] = useState(false);

  // Truncate description for swipe mode
  const truncateDescription = (text: string, wordLimit = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };
  
  const description = isSwipeMode 
    ? truncateDescription(program.description || '')
    : program.description || 'No description available';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (program.deadline) {
      const formatted = formatDate(program.deadline);
      setFormattedDeadline(formatted);
    }
  }, [program.deadline]);

  if (!isMounted) {
    return null;
  }

  // Calculate rotation and position for card based on style
  const rot = style?.rot || 0;
  const xPos = style?.x || 0;
  
  // Determine swipe direction indicators based on drag position
  const showLeftIndicator = xPos < -50;
  const showRightIndicator = xPos > 50;

  return (
    <AnimatedDiv
      {...props}
      style={{
        ...style,
        display: 'block', // Ensure it's displayed
        width: '100%',
        height: '100%',
        boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
        borderRadius: '1rem',
        touchAction: 'none', // Prevent browser handling of touch gestures
      }}
      className="absolute w-[70vw] sm:w-[320px] md:w-[380px] lg:w-[450px] h-[600px] sm:h-[700px] lg:h-[800px] bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Swipe Indicators */}
      {showLeftIndicator && (
        <div className="absolute top-6 right-6 z-10 bg-red-500 text-white font-bold py-2 px-4 rounded-lg transform -rotate-12 shadow-lg">
          REJECT
        </div>
      )}
      
      {showRightIndicator && (
        <div className="absolute top-6 left-6 z-10 bg-green-500 text-white font-bold py-2 px-4 rounded-lg transform rotate-12 shadow-lg">
          SAVE
        </div>
      )}

      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalProgram',
            name: program.title,
            description: program.description,
            organization: program.organization,
            location: program.location,
            deadline: program.deadline,
            image: program.imageUrl,
          }),
        }}
      />

      {/* Children go here */}
      <div className="relative h-1/2">
        <Image
          src={program.imageUrl || '/images/default-opportunity.jpg'}
          alt={program.title || 'No Image Available'}
          width={600}    // Specify width
          height={400}   // Specify height
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{program.title}</h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/90">{program.organization}</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">{description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>Deadline: {formattedDeadline}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>{program.location}</span>
          </div>

          {program.stipend && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>{program.stipend}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="flex items-center text-gray-700 font-semibold">
            <GraduationCap className="w-5 h-5 mr-2" aria-hidden="true" />
            Eligibility
          </h3>
          {Array.isArray(program.eligibility) ? (
            <ul className="list-disc list-inside text-gray-600 ml-2">
              {program.eligibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 ml-2">
              {program.eligibility || 'No eligibility information available'}
            </p>
          )}
        </div>
      </div>
    </AnimatedDiv>
  );
}