'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/types';
import { Check } from 'lucide-react';
import { useTrending } from '@/lib/context/TrendingContext';

export default function FilterTags() {
  const { state, setFilters } = useTrending();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedTagSet = new Set(state.filters.categories || []);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags?featured=true');
      const result = await response.json();
      
      if (result.success) {
        setTags(result.data);
      } else {
        setError('Failed to load tags');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tagName: string) => {
    const currentCategories = state.filters.categories || [];
    const isSelected = currentCategories.includes(tagName);
    
    // 单选模式：如果已选中则取消选择，否则只选择当前分类
    const newCategories = isSelected ? [] : [tagName];
    setFilters({ categories: newCategories });
  };

  const clearAllTags = () => {
    setFilters({ categories: [] });
  };

  const getTagStyle = (category: string, isSelected: boolean) => {
    const baseClasses = 'flex items-center justify-between w-full px-2 md:px-3 py-1.5 md:py-2 text-left border rounded-lg transition-all duration-200 hover:shadow-sm';
    
    if (isSelected) {
      switch (category) {
        case 'framework':
          return `${baseClasses} bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300`;
        case 'application':
          return `${baseClasses} bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300`;
        case 'technology':
          return `${baseClasses} bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300`;
        default:
          return `${baseClasses} bg-gray-50 border-gray-300 text-gray-800 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-300`;
      }
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={fetchTags}
          className="text-blue-500 hover:text-blue-600 text-sm mt-2"
        >
          重试
        </button>
      </div>
    );
  }

  // 按分类分组标签
  const groupedTags = tags.reduce((groups, tag) => {
    const category = tag.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tag);
    return groups;
  }, {} as Record<string, Tag[]>);

  const categoryNames = {
    'framework': '🚀 框架类',
    'application': '💡 应用类',
    'technology': '⚙️ 技术类'
  };

  return (
    <div className="space-y-4">
      {/* 清除按钮 */}
      {selectedTagSet.size > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            已筛选: {Array.from(selectedTagSet)[0]}
          </span>
          <button
            onClick={clearAllTags}
            className="text-xs md:text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          >
            清除
          </button>
        </div>
      )}

      {/* 扁平化标签列表 */}
      <div className="space-y-2">
        {tags.map((tag) => {
          const isSelected = selectedTagSet.has(tag.name);
          return (
            <button
              key={tag.id}
              onClick={() => handleTagSelect(tag.name)}
              className={getTagStyle(tag.category, isSelected)}
            >
              <span className="text-xs md:text-sm font-medium">
                {tag.displayName || tag.name}
              </span>
              {isSelected && (
                <Check className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* 如果没有标签 */}
      {tags.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>暂无可用标签</p>
        </div>
      )}
    </div>
  );
}