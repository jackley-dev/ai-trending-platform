'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Item, TrendingFilters } from '@/types';

interface TrendingState {
  // 数据
  items: Item[];
  loading: boolean;
  error: string | null;
  
  // 筛选和排序
  filters: TrendingFilters;
  
  // 分页
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // 统计信息
  stats: {
    total: number;
    today: number;
    lastUpdate: string;
  };
}

type TrendingAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SET_FILTERS'; payload: Partial<TrendingFilters> }
  | { type: 'SET_PAGINATION'; payload: Partial<TrendingState['pagination']> }
  | { type: 'SET_STATS'; payload: Partial<TrendingState['stats']> }
  | { type: 'RESET_FILTERS' };

const initialState: TrendingState = {
  items: [],
  loading: true,
  error: null,
  filters: {
    tags: [],
    categories: [],
    timespan: 'monthly',
    sortBy: 'date',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  },
  stats: {
    total: 0,
    today: 0,
    lastUpdate: ''
  }
};

function trendingReducer(state: TrendingState, action: TrendingAction): TrendingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      // 只有在真的有错误时才设置loading=false，清空错误时保持loading状态
      const shouldStopLoading = action.payload !== null;
      return {
        ...state,
        error: action.payload,
        loading: shouldStopLoading ? false : state.loading
      };

    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // 重置到第一页
        loading: true // 筛选变化时重新进入加载状态
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        pagination: initialState.pagination
      };
    
    default:
      return state;
  }
}

interface TrendingContextValue {
  state: TrendingState;
  dispatch: React.Dispatch<TrendingAction>;
  
  // 便捷方法
  setFilters: (filters: Partial<TrendingFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  fetchItems: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

const TrendingContext = createContext<TrendingContextValue | undefined>(undefined);

export function TrendingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(trendingReducer, initialState);

  // 便捷方法
  const setFilters = (filters: Partial<TrendingFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_PAGINATION', payload: { page } });
  };

  // 获取项目数据
  const fetchItems = async () => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 1000; // 最小加载时间1秒，确保skeleton可见（生产环境缩短）

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const params = new URLSearchParams({
        sortBy: state.filters.sortBy || 'date',
        sortOrder: state.filters.sortOrder || 'desc',
        timespan: state.filters.timespan || 'daily',
        limit: state.filters.limit?.toString() || '20',
        offset: (((state.pagination.page - 1) * state.pagination.limit) || 0).toString()
      });

      if (state.filters.tags && state.filters.tags.length > 0) {
        params.set('tags', state.filters.tags.join(','));
      }

      if (state.filters.categories && state.filters.categories.length > 0) {
        params.set('categories', state.filters.categories.join(','));
      }

      if (state.filters.minPopularity) {
        params.set('minPopularity', state.filters.minPopularity.toString());
      }

      if (state.filters.language) {
        params.set('language', state.filters.language);
      }

      const response = await fetch(`/api/items?${params}`);
      const result = await response.json();

      // 等待最小loading时间，然后设置结果
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

      // 使用Promise.all同时等待最小时间和处理结果
      await Promise.all([
        remainingTime > 0 ? new Promise(resolve => setTimeout(resolve, remainingTime)) : Promise.resolve(),
        (async () => {
          if (result.success) {
            // 延迟设置状态直到最小时间结束
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            dispatch({ type: 'SET_ITEMS', payload: result.data });
            dispatch({
              type: 'SET_PAGINATION',
              payload: {
                total: result.pagination.total,
                hasMore: result.pagination.hasMore
              }
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to load items' });
          }
        })()
      ]);
    } catch (error) {
      // 即使出错也要等待最小时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
      console.error('Failed to fetch items:', error);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();

      if (result.success) {
        dispatch({
          type: 'SET_STATS',
          payload: {
            total: result.data.items.total,
            today: result.data.items.today,
            lastUpdate: result.data.lastUpdate
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // 当filters或pagination改变时重新获取数据
  useEffect(() => {
    fetchItems();
  }, [state.filters, state.pagination.page]);

  // 初始化时获取统计数据
  useEffect(() => {
    fetchStats();
    // 每5分钟更新一次统计数据
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value: TrendingContextValue = {
    state,
    dispatch,
    setFilters,
    resetFilters,
    setPage,
    fetchItems,
    fetchStats
  };

  return (
    <TrendingContext.Provider value={value}>
      {children}
    </TrendingContext.Provider>
  );
}

export function useTrending() {
  const context = useContext(TrendingContext);
  if (context === undefined) {
    throw new Error('useTrending must be used within a TrendingProvider');
  }
  return context;
}