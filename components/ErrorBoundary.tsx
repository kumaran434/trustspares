import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
             </div>
             <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
             <p className="text-sm text-gray-500 mb-6 font-medium">
                {this.state.error?.message || "An unexpected error occurred."}
             </p>
             <button 
                onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                }}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
             >
                <RefreshCw size={16} /> Reload App
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
