import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
        <p className="text-gray-600 mt-2">Monitor and manage student college preparation progress</p>
      </div>
    </div>
  );
};

export default Header;