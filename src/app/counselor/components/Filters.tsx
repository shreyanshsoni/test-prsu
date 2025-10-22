import React from 'react';
import { Search } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import { FilterOption, FilterType } from '../../../types/counselor';
import { getUniqueGrades } from '../../../data/counselorStudents';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const uniqueGrades = getUniqueGrades();

  const gradeOptions: FilterOption[] = [
    { value: 'All', label: 'All Grades' },
    ...uniqueGrades.map(grade => ({ value: grade, label: String(grade) })),
  ];

  return (
    <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-gray-400'} w-4 h-4 z-10`} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent relative`}
          />
        </div>
        <FilterDropdown
          label=""
          options={gradeOptions}
          selectedValue={selectedGrade}
          onChange={(value) => onGradeChange(value === 'All' ? 'All' : Number(value))}
        />
      </div>
    </div>
  );
};

export default Filters;
