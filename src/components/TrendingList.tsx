'use client';

import ItemCard from './ItemCard';
import LoadingSkeleton from './LoadingSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrending } from '@/lib/context/TrendingContext';

export default function TrendingList() {
  const { state, setPage } = useTrending();
  const { items, loading, error, filters, pagination } = state;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // 显示加载状态：初始加载或正在加载更多数据
  if (loading) {
    return <LoadingSkeleton count={8} />;
  }

  // 显示错误状态：只有在非加载状态下才显示错误
  if (error && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">😕 加载失败</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  // 显示空状态：只有在加载完成且确实无数据时才显示
  if (items.length === 0 && !loading && !error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-github-text mb-2">
          未找到相关项目
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {filters.tags && filters.tags.length > 0
            ? `没有找到包含标签 "${filters.tags.join(', ')}" 的项目`
            : '当前时间范围内暂无trending项目'
          }
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>建议:</p>
          <ul className="mt-2 space-y-1">
            <li>• 尝试切换时间范围 (今日/本周/本月)</li>
            <li>• 减少筛选标签</li>
            <li>• 等待数据同步更新</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 结果统计 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
        <div>
          找到 <span className="font-medium text-gray-900 dark:text-github-text">{pagination.total}</span> 个相关项目
          {filters.tags && filters.tags.length > 0 && (
            <span className="block sm:inline sm:ml-2">
              (筛选条件: {filters.tags.join(', ')})
            </span>
          )}
        </div>
        <div>
          第 {pagination.page} 页,共 {totalPages} 页
        </div>
      </div>

      {/* 项目列表 */}
      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* 加载状态 */}
      {loading && items.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center items-center space-x-1 md:space-x-2 py-6 md:py-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 dark:border-github-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" />
            <span className="hidden sm:inline">上一页</span>
            <span className="sm:hidden">上页</span>
          </button>

          {/* 页码 */}
          <div className="flex space-x-0.5 md:space-x-1">
            {[...Array(Math.min(3, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (pagination.page <= 2) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 1) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = pagination.page - 1 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border rounded-lg ${
                    pageNum === pagination.page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 dark:border-github-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasMore}
            className="flex items-center px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 dark:border-github-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <span className="hidden sm:inline">下一页</span>
            <span className="sm:hidden">下页</span>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5 md:ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}