import { useState } from 'react';
import { Program } from '../types/types';

export function usePrograms() {
  const [programs] = useState<Program[]>([
    {
      id: 'program-1',
      title: 'Computer Science Internship',
      organization: 'Tech Corp',
      description: 'A summer internship for computer science students.',
      deadline: '2024-06-30',
      location: 'Remote',
      type: 'internship',
      imageUrl: '/images/cs-internship.jpg',
      eligibility: ['Undergraduate', 'Computer Science Major'],
      stipend: '$5000',
      field: 'Computer Science',
      degreeLevel: 'Undergraduate',
      requirements: ['Resume', 'Cover Letter', 'Transcript'],
      startDate: '2024-07-01',
    },
    {
      id: 'program-2',
      title: 'Research Fellowship',
      organization: 'Science Institute',
      description: 'A year-long research fellowship for graduate students.',
      deadline: '2024-07-15',
      location: 'New York, NY',
      type: 'research',
      imageUrl: '/images/research-fellowship.jpg',
      eligibility: ['Graduate Student', 'STEM Major'],
      stipend: '$30000',
      field: 'STEM',
      degreeLevel: 'Graduate',
      requirements: ['Research Proposal', 'Letters of Recommendation'],
      startDate: '2024-09-01',
    },
  ]);

  return { programs };
}