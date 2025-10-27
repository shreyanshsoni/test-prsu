import { Program } from '../../types/types';

export const programs: Program[] = [
  {
    id: '1',
    title: 'Computer Science and AI Program',
    organization: 'MIT',
    description: 'An intensive program focusing on artificial intelligence, machine learning, and advanced computer science concepts.',
    deadline: '2024-03-31',
    location: 'Cambridge, MA',
    type: 'research',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80',
    eligibility: ['Strong programming background', 'GPA 3.5+', 'Advanced mathematics coursework'],
    field: 'computer_science',
    degreeLevel: 'undergraduate',
    requirements: [
      'Official transcripts',
      'Three letters of recommendation',
      'Programming portfolio',
      'Statement of purpose'
    ],
    startDate: '2024-09-01'
  },
  {
    id: '2',
    title: 'Biomedical Engineering Research Fellowship',
    organization: 'Stanford',
    description: 'Research opportunity in biomedical engineering, focusing on medical device innovation and tissue engineering.',
    deadline: '2024-04-15',
    location: 'Stanford, CA',
    type: 'research',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80',
    eligibility: ['Biology or Engineering background', 'Lab experience', 'GPA 3.4+'],
    field: 'engineering',
    degreeLevel: 'graduate',
    requirements: [
      'Research proposal',
      'Two letters of recommendation',
      'Academic transcripts',
      'CV/Resume'
    ],
    startDate: '2024-08-15'
  },
  {
    id: '3',
    title: 'Global Business Leadership Program',
    organization: 'Harvard',
    description: 'Intensive summer program exploring global business strategies, leadership, and entrepreneurship.',
    deadline: '2024-03-01',
    location: 'Boston, MA',
    type: 'summer',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80',
    eligibility: ['Business or Economics major', 'Leadership experience', 'GPA 3.3+'],
    field: 'business',
    degreeLevel: 'undergraduate',
    requirements: [
      'Personal statement',
      'Leadership essay',
      'Two recommendations',
      'Resume'
    ],
    startDate: '2024-06-15'
  },
  {
    id: '4',
    title: 'Environmental Science Research Initiative',
    organization: 'Stanford',
    description: 'Research program focused on climate change, sustainability, and environmental policy.',
    deadline: '2024-05-01',
    location: 'Stanford, CA',
    type: 'research',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80',
    eligibility: ['Environmental Science background', 'Research experience', 'GPA 3.5+'],
    field: 'environmental_science',
    degreeLevel: 'graduate',
    requirements: [
      'Research proposal',
      'Writing sample',
      'Three recommendations',
      'Transcripts'
    ],
    startDate: '2024-09-15'
  },
  {
    id: '5',
    title: 'Quantum Computing Summer Institute',
    organization: 'MIT',
    description: 'Advanced program exploring quantum computing theory and practical applications.',
    deadline: '2024-02-28',
    location: 'Cambridge, MA',
    type: 'summer',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80',
    eligibility: ['Physics or Computer Science background', 'Advanced quantum mechanics', 'GPA 3.7+'],
    field: 'computer_science',
    degreeLevel: 'graduate',
    requirements: [
      'Research statement',
      'Quantum mechanics coursework',
      'Two faculty recommendations',
      'Technical interview'
    ],
    startDate: '2024-06-01'
  }
];