import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NASA API Error Boundary caught an error:', error, errorInfo);
    
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      // Analytics/Sentry integration here
      console.error('Production error in NASA API:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <div className="sky-card p-6 text-center">
            <div className="text-red-400/60 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-serif text-star mb-2">
              NASA-Daten temporär nicht verfügbar
            </h3>
            <p className="text-star-60 mb-6 max-w-md mx-auto text-sm">
              {this.state.error?.message?.includes('fetch') 
                ? 'Verbindung zu NASA-Servern fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung.'
                : 'Es gab ein Problem beim Laden der Weltraum-Daten. Versuchen Sie es in einem Moment erneut.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Erneut versuchen
            </button>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-star-35 cursor-pointer hover:text-star-60">
                  Technische Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-[rgba(0,0,0,0.3)] rounded text-xs text-red-300 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for specific NASA API sections
export function NASAApiErrorBoundary({ children, apiName }: { children: ReactNode; apiName: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="sky-card p-4 text-center border border-red-400/20 bg-red-400/5">
          <AlertTriangle className="w-6 h-6 text-red-400/60 mx-auto mb-2" />
          <p className="text-sm text-star-60">
            {apiName} ist momentan nicht verfügbar
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}