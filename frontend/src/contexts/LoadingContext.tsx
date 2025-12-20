import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);
  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  // 将稳定的函数放在一个单独的 memo 中
  const actions = useMemo(() => ({
    setLoading,
    showLoading,
    hideLoading
  }), [setLoading, showLoading, hideLoading]);

  const contextValue = useMemo(() => ({
    isLoading,
    ...actions
  }), [isLoading, actions]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {useMemo(() => isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">加载中...</div>
        </div>
      ), [isLoading])}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
