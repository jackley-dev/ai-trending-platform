import { Item } from '@/types';
import { Star, GitFork, Eye, Calendar, ExternalLink } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ItemCardProps {
  item: Item;
  showTrendingInfo?: boolean;
}

export default function ItemCard({ item, showTrendingInfo = true }: ItemCardProps) {
  // 安全地解析metrics字段，处理不同的数据格式
  const parseMetrics = () => {
    try {
      let rawMetrics;
      if (typeof item.metrics === 'string') {
        rawMetrics = JSON.parse(item.metrics);
      } else if (typeof item.metrics === 'object' && item.metrics !== null) {
        rawMetrics = item.metrics;
      } else {
        return { primary: 0, secondary: 0, engagement: 0 };
      }

      // 处理新格式：{primary, secondary, engagement}
      if ('primary' in rawMetrics) {
        return {
          primary: rawMetrics.primary || 0,
          secondary: rawMetrics.secondary || 0,
          engagement: rawMetrics.engagement || 0
        };
      }
      
      // 处理旧格式：{stars, forks, watchers, issues}
      if ('stars' in rawMetrics) {
        return {
          primary: rawMetrics.stars || 0,
          secondary: rawMetrics.forks || 0,
          engagement: rawMetrics.issues || rawMetrics.watchers || 0
        };
      }

      // 默认情况
      return { primary: 0, secondary: 0, engagement: 0 };
    } catch (error) {
      console.warn('Failed to parse metrics:', error);
      return { primary: 0, secondary: 0, engagement: 0 };
    }
  };

  const metrics = parseMetrics();
  
  const getTagStyle = (category: string) => {
    switch (category) {
      case 'framework':
        return 'tag-framework';
      case 'application':
        return 'tag-application';
      case 'technology':
        return 'tag-technology';
      default:
        return 'tag bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="trending-item group">
      {/* 项目头部信息 */}
      <div className="trending-item-header">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <a 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="trending-item-title group-hover:text-blue-700 dark:group-hover:text-blue-400"
            >
              {item.title}
            </a>
            <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {item.authorName && (
            <div className="flex items-center text-sm text-gray-600 dark:text-github-muted mb-2">
              <span>by </span>
              <a 
                href={item.authorUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-gray-800 dark:hover:text-github-text ml-1"
              >
                {item.authorName}
              </a>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-github-text">
            {item.popularityScore}
          </div>
          <div className="text-xs text-gray-500 dark:text-github-muted">
            热度分数
          </div>
        </div>
      </div>

      {/* 项目描述 */}
      {item.description && (
        <p className="trending-item-description">
          {item.description}
        </p>
      )}

      {/* 标签 */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.slice(0, 5).map((itemTag) => (
            <span
              key={itemTag.id}
              className={`tag ${getTagStyle(itemTag.tag?.category || '')}`}
            >
              {itemTag.tag?.displayName || itemTag.tag?.name}
            </span>
          ))}
          {item.tags.length > 5 && (
            <span className="text-xs text-gray-500 dark:text-github-muted">
              +{item.tags.length - 5} 更多
            </span>
          )}
        </div>
      )}

      {/* 项目统计信息 */}
      <div className="trending-item-meta">
        <div className="trending-item-stats">
          <div className="trending-item-stat">
            <Star className="w-4 h-4" />
            <span>{formatNumber(metrics.primary || 0)}</span>
          </div>
          
          {metrics.secondary !== undefined && (
            <div className="trending-item-stat">
              <GitFork className="w-4 h-4" />
              <span>{formatNumber(metrics.secondary)}</span>
            </div>
          )}
          
          {metrics.engagement !== undefined && (
            <div className="trending-item-stat">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(metrics.engagement)}</span>
            </div>
          )}

          {item.processedMetadata?.language && (
            <div className="trending-item-stat">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>{item.processedMetadata.language}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDistance(new Date(item.publishedAt), new Date(), {
                addSuffix: true,
                locale: zhCN
              })}
            </span>
          </div>
          
          {showTrendingInfo && item.trendingDate && (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Trending
            </div>
          )}
        </div>
      </div>
    </div>
  );
}