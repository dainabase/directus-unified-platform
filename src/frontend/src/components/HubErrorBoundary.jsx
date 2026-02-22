/**
 * HubErrorBoundary — Error boundary for integration hub components.
 * Catches render errors and shows a DS-styled fallback with retry.
 *
 * @version 1.0.0
 * @date 2026-02-22
 */

import React from 'react'

class HubErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ds-card p-6" style={{ borderLeft: '3px solid var(--semantic-orange)' }}>
          <p style={{ color: 'var(--label-1)', fontWeight: 600, marginBottom: 'var(--s2)' }}>
            Ce module a rencontre une erreur.
          </p>
          <p className="ds-meta" style={{ marginBottom: 'var(--s4)' }}>
            Rechargez le module ou contactez l'administrateur si le probleme persiste.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="ds-btn ds-btn-secondary"
          >
            Reessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default HubErrorBoundary
