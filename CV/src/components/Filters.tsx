import React from 'react';
import { Search } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import { FilterOption, FilterType } from '../types';
import { getUniqueGrades } from '../data/students';

interface FiltersProps {
  selectedGrade: FilterType;
  searchTerm: string;
  onGradeChange: (grade: FilterType) => void;
  onSearchChange: (search: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  selectedGrade,
  searchTerm,
  onGradeChange,
  onSearchChange,
}) => {
  const uniqueGrades = getUniqueGrades();

  const gradeOptions: FilterOption[] = [
    { value: 'All', label: 'All' },
    ...uniqueGrades.map(grade => ({ value: grade, label: String(grade) })),
  ];


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown
          label="Grade"
          options={gradeOptions}
          selectedValue={selectedGrade}
          onChange={(value) => onGradeChange(value === 'All' ? 'All' : Number(value))}
        />
      </div>
    </div>
  );
};

export default Filters;