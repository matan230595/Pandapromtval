import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // If it's a chunk loading error, reload the page
    if (error.name === 'ChunkLoadError' || error.message.includes('text/html') || error.message.includes('dynamically imported module')) {
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">משהו השתבש...</h1>
            <p className="mb-6 text-slate-600">אנא רענן את העמוד כדי להמשיך.</p>
            <button 
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              רענן עמוד
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
