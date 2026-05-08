import React from 'react';

export default function SearchFilter({ 
  searchValue, 
  onSearchChange, 
  filterValue, 
  onFilterChange, 
  filterOptions = [],
  searchPlaceholder = "Search...",
  filterPlaceholder = "Filter..."
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
      {filterOptions.length > 0 && (
        <div className="sm:w-48">
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">{filterPlaceholder}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
