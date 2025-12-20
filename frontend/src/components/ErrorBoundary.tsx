import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from "@sentry/react";
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你也可以将错误日志上报给服务器
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    
    // 上报到 Sentry
    Sentry.captureException(error, { extra: { errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>出错了</h1>
            <p>抱歉，应用程序遇到了一些问题。请尝试刷新页面或点击下方按钮重试。</p>
            {this.state.error && (
              <details className="error-details">
                <summary>错误详情</summary>
                <pre>{this.state.error.message}</pre>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            <div className="error-actions">
              <button 
                className="btn-primary" 
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
              <button 
                className="btn-secondary" 
                onClick={this.handleReset}
              >
                重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
