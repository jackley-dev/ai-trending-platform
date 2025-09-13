'use client';

import { useTrending } from '@/lib/context/TrendingContext';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function StatsDisplay() {
  const { state } = useTrending();
  const { stats } = state;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-github-border p-4 text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.today ? formatNumber(stats.today) : '--'}
        </div>
        <div className="text-sm text-gray-500 dark:text-github-muted">今日新项目</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-github-border p-4 text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.total ? formatNumber(stats.total) : '--'}
        </div>
        <div className="text-sm text-gray-500 dark:text-github-muted">总项目数</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-github-border p-4 text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {stats.tags?.active ? formatNumber(stats.tags.active) : '15+'}
        </div>
        <div className="text-sm text-gray-500 dark:text-github-muted">活跃标签</div>
      </div>
    </div>
  );
}

// 最后更新时间组件
export function LastUpdateDisplay() {
  const { state } = useTrending();
  const { stats } = state;

  if (!stats.lastUpdate) {
    return <span>数据更新时间: --</span>;
  }

  const lastUpdateDate = new Date(stats.lastUpdate);
  const timeAgo = formatDistance(lastUpdateDate, new Date(), {
    addSuffix: true,
    locale: zhCN
  });

  return (
    <span title={lastUpdateDate.toLocaleString('zh-CN')}>
      数据更新: {timeAgo}
    </span>
  );
}