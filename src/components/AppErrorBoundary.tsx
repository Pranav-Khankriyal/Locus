import { Component, type ReactNode, type ErrorInfo } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: boolean; errorDetails?: string }> {
  state = { error: false, errorDetails: '' };

  static getDerivedStateFromError(error: Error) {
    return { error: true, errorDetails: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">This view couldn’t load</h1>
            <p className="text-xs text-gray-500 mb-6">
              {this.state.errorDetails || 'A temporary rendering error occurred. Please reload to refresh the state.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => {
                  this.setState({ error: false });
                  window.location.reload();
                }}
              >
                Reload page
              </button>
              <a className="btn btn-outline" href="/dashboard">
                Go to Dashboard
              </a>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
