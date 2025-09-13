import { Suspense } from 'react';
import TrendingList from '@/components/TrendingList';
import FilterTags from '@/components/FilterTags';
import SortControls from '@/components/SortControls';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import StatsDisplay, { LastUpdateDisplay } from '@/components/StatsDisplay';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 页面标题和说明 */}
      <div className="text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-github-text mb-4">
          🤖 AI Agent & LLM Trending
        </h1>
        <p className="text-sm md:text-lg text-gray-600 dark:text-github-muted max-w-3xl mx-auto">
          发现最新最热的AI Agent和LLM相关开源项目，涵盖
          <span className="font-semibold text-purple-600 dark:text-purple-400"> Framework</span>、
          <span className="font-semibold text-blue-600 dark:text-blue-400"> Application</span>、
          <span className="font-semibold text-green-600 dark:text-green-400"> Technology </span>
          三大领域
        </p>
      </div>

      {/* 统计信息 */}
      <StatsDisplay />

      {/* 筛选和排序控件 */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 px-4">
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-github-border p-3 md:p-4 lg:sticky lg:top-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-github-text mb-3 md:mb-4">
              🏷️ 筛选标签
            </h2>
            <Suspense fallback={<div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>}>
              <FilterTags />
            </Suspense>
          </div>
        </div>

        <div className="lg:w-3/4 space-y-3 md:space-y-4">
          {/* 排序控件 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-github-border p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-github-text">排序方式:</span>
              <SortControls />
            </div>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 dark:text-github-muted">
              <LastUpdateDisplay />
            </div>
          </div>

          {/* 项目列表 */}
          <Suspense fallback={<LoadingSkeleton />}>
            <TrendingList />
          </Suspense>
        </div>
      </div>

      {/* 页面底部信息 */}
      <div className="text-center pt-8 border-t border-gray-200 dark:border-github-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-github-text mb-2">
              🚀 Framework类项目
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              LangChain, LlamaIndex, AutoGen, CrewAI 等主流AI框架
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-github-text mb-2">
              💡 Application类项目  
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              代码生成、聊天机器人、RAG系统、Agent工具等应用
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-github-text mb-2">
              ⚙️ Technology类项目
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              向量数据库、模型微调、提示工程等核心技术
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}