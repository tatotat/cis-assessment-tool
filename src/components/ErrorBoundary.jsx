import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Top-level error boundary. Without it, any render exception blanks the whole
 * app with no message. Offers reload and a "start over" that clears persisted
 * assessment state (the most likely source of a corrupt-state crash).
 *
 * Class component by necessity — React has no hook equivalent of
 * getDerivedStateFromError. Strings are deliberately not translated: if i18n
 * itself is what threw, t() would not be safe to call here.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  handleReload = () => window.location.reload();

  handleStartOver = () => {
    try { localStorage.removeItem('cis-assessment-storage'); } catch {}
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-4">
            The page hit an unexpected error. Your saved progress is safe on the server — reloading usually fixes this.
          </p>
          <pre className="text-left text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-4 overflow-auto max-h-32">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div className="flex gap-2 justify-center">
            <button onClick={this.handleReload} className="btn-primary text-sm">
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
            <button onClick={this.handleStartOver} className="btn-secondary text-sm">
              <Home className="w-4 h-4" /> Start over
            </button>
          </div>
        </div>
      </div>
    );
  }
}
