import React from 'react';
import { FilterOption } from '../types';

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue: string | number;
  onChange: (value: string | number) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="flex flex-col mb-4">
      <label className="mb-2 text-gray-700">{label}</label>
      <div className="relative">
        <select
          value={String(selectedValue)}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;