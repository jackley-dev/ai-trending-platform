'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTrending } from '@/lib/context/TrendingContext';

export default function SortControls() {
  const { state, setFilters } = useTrending();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTimespanDropdown, setShowTimespanDropdown] = useState(false);

  const sortOptions = [
    { value: 'popularity-desc', label: '热度降序', sortBy: 'popularity', sortOrder: 'desc' },
    { value: 'popularity-asc', label: '热度升序', sortBy: 'popularity', sortOrder: 'asc' },
    { value: 'date-desc', label: '最新发布', sortBy: 'date', sortOrder: 'desc' },
    { value: 'date-asc', label: '最早发布', sortBy: 'date', sortOrder: 'asc' },
    { value: 'relevance-desc', label: '相关性', sortBy: 'relevance', sortOrder: 'desc' }
  ];

  const timespanOptions = [
    { value: 'daily', label: '今日' },
    { value: 'weekly', label: '本周' },
    { value: 'monthly', label: '本月' }
  ];

  const { sortBy = 'popularity', sortOrder = 'desc', timespan = 'daily' } = state.filters;
  
  const currentSort = sortOptions.find(opt => opt.sortBy === sortBy && opt.sortOrder === sortOrder);
  const currentTimespan = timespanOptions.find(opt => opt.value === timespan);

  const handleSortSelect = (option: typeof sortOptions[0]) => {
    setFilters({
      sortBy: option.sortBy as 'popularity' | 'date' | 'relevance',
      sortOrder: option.sortOrder as 'asc' | 'desc'
    });
    setShowSortDropdown(false);
  };

  const handleTimespanSelect = (option: typeof timespanOptions[0]) => {
    setFilters({ timespan: option.value as 'daily' | 'weekly' | 'monthly' });
    setShowTimespanDropdown(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
      {/* 时间范围选择 */}
      <div className="relative">
        <button
          onClick={() => setShowTimespanDropdown(!showTimespanDropdown)}
          className="filter-button text-xs md:text-sm"
        >
          <span>{currentTimespan?.label}</span>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
        </button>
        
        {showTimespanDropdown && (
          <div className="absolute top-full left-0 mt-2 w-28 md:w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-github-border rounded-lg shadow-lg z-10">
            {timespanOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimespanSelect(option)}
                className={`w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                  option.value === timespan 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 排序方式选择 */}
      <div className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="filter-button text-xs md:text-sm"
        >
          <span>{currentSort?.label}</span>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
        </button>
        
        {showSortDropdown && (
          <div className="absolute top-full left-0 mt-2 w-32 md:w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-github-border rounded-lg shadow-lg z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option)}
                className={`w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                  option.sortBy === sortBy && option.sortOrder === sortOrder
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}