import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 生成唯一错误ID用于跟踪
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到控制台（在生产环境中可以发送到监控服务）
    console.group('🚨 ErrorBoundary捕获错误');
    console.error('错误ID:', this.state.errorId);
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('错误边界信息:', errorInfo);
    console.groupEnd();

    // 保存错误信息到状态（供调试使用，不会显示给用户）
    this.setState({
      errorInfo
    });

    // 在生产环境中，这里应该发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToMonitoringService(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportErrorToMonitoringService = (error: Error, errorInfo: React.ErrorInfo) => {
    // TODO: 集成实际的错误监控服务（如 Sentry、Bugsnag 等）
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    console.log('错误报告:', errorReport);
    
    // 示例：发送到监控服务
    // monitoringService.reportError(errorReport);
  };

  private getCurrentUserId = (): string | null => {
    try {
      // 从localStorage或sessionStorage获取用户ID
      const userId = localStorage.getItem('current_user_id');
      return userId || null;
    } catch {
      return null;
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      errorInfo: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
          <div className="max-w-md w-full">
            {/* 主要错误界面 */}
            <div className="bg-white rounded-lg shadow-lg border border-background-divider p-8 text-center">
              {/* 错误图标 */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              {/* 错误标题 */}
              <h1 className="text-2xl font-bold text-text-primary mb-4">
                页面出现错误
              </h1>

              {/* 错误描述 */}
              <p className="text-text-secondary mb-6">
                很抱歉，页面遇到了意外错误。我们已经记录了这个问题并会尽快修复。
              </p>

              {/* 错误ID（仅开发环境显示） */}
              {isDevelopment && this.state.errorId && (
                <div className="bg-gray-50 rounded p-3 mb-6 text-left">
                  <p className="text-xs text-gray-600 mb-1">错误ID:</p>
                  <p className="text-sm font-mono text-gray-800">{this.state.errorId}</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>重试</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-background-divider text-text-primary rounded-md hover:bg-background-surface transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>返回首页</span>
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="flex-1 px-4 py-3 border border-background-divider text-text-primary rounded-md hover:bg-background-surface transition-colors"
                  >
                    刷新页面
                  </button>
                </div>
              </div>

              {/* 开发环境下的调试信息 */}
              {isDevelopment && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    展开技术详情（仅开发环境）
                  </summary>
                  <div className="mt-3 bg-gray-50 rounded p-4 text-xs font-mono">
                    <div className="mb-4">
                      <p className="font-semibold text-red-600">错误消息:</p>
                      <p className="text-red-700">{this.state.error.message}</p>
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-700">错误堆栈:</p>
                        <pre className="whitespace-pre-wrap text-gray-600">{this.state.error.stack}</pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="font-semibold text-gray-700">组件堆栈:</p>
                        <pre className="whitespace-pre-wrap text-gray-600">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* 联系支持（生产环境） */}
              {!isDevelopment && (
                <div className="mt-6 pt-6 border-t border-background-divider">
                  <p className="text-sm text-text-secondary">
                    如果问题持续存在，请联系我们的技术支持团队
                  </p>
                  <p className="text-xs text-text-tertiary mt-2">
                    错误ID: {this.state.errorId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}