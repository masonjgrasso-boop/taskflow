import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PasswordGate from './components/PasswordGate.jsx'

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: 13 }}>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '6px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reload</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PasswordGate>
        <App />
      </PasswordGate>
    </ErrorBoundary>
  </React.StrictMode>,
)
