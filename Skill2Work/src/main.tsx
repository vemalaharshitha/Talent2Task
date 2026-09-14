import { StrictMode, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { LanguageProvider } from './i18n/LanguageContext';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Talent2Task Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#0f172a', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '1rem' }}>Application Notice</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>An error occurred while rendering the page.</p>
            <pre style={{ background: '#020617', padding: '1rem', borderRadius: '0.5rem', color: '#f43f5e', fontSize: '0.75rem', overflowX: 'auto', textAlign: 'left', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Unknown Error'}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ background: '#4f46e5', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Purge legacy caches to ensure fresh assets and logos
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name !== 'talent2task-offline-v3') {
            caches.delete(name);
          }
        });
      });
    }

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update();
      console.log('Talent2Task Offline Engine Ready:', reg.scope);
    }).catch((error) => {
      console.warn('Offline engine notice:', error);
    });
  });
}
