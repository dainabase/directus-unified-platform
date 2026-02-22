import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="ds-card text-center" style={{ maxWidth: 480, padding: 32 }}>
            <div className="flex justify-center mb-4">
              <AlertTriangle size={48} style={{ color: 'var(--semantic-red)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--label-1)', marginBottom: 8 }}>
              Une erreur est survenue
            </h2>
            <p style={{ fontSize: 14, color: 'var(--label-2)', marginBottom: 24, lineHeight: 1.5 }}>
              L'application a rencontre un probleme inattendu. Essayez de recharger la page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="ds-btn ds-btn-secondary"
              >
                Reessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="ds-btn ds-btn-primary flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
