import React, { useEffect } from 'react'

const EmergencyDashboard = () => {
  useEffect(() => {
    console.log('⚡ EmergencyDashboard monté avec succès !')
  }, [])

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h1 style={{ 
          color: '#333', 
          fontSize: '32px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          🚨 Dashboard d'Urgence Opérationnel
        </h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#666', fontSize: '20px', marginBottom: '10px' }}>
            ✅ Composants qui fonctionnent :
          </h2>
          <ul style={{ color: '#555', lineHeight: '1.8' }}>
            <li>✅ React est chargé</li>
            <li>✅ App.jsx fonctionne</li>
            <li>✅ Le routing est OK</li>
            <li>✅ Ce composant s'affiche</li>
          </ul>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#666', fontSize: '20px', marginBottom: '10px' }}>
            📊 Données de test :
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '10px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>€2.4M</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>ARR</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '20px',
              borderRadius: '10px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>7.3</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Runway (mois)</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '20px',
              borderRadius: '10px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>18.5%</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>EBITDA</div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#f0f0f0',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '30px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>
            🔧 Prochaines étapes :
          </h3>
          <ol style={{ color: '#555', lineHeight: '1.8' }}>
            <li>Vérifier la console pour les erreurs</li>
            <li>Tester les imports un par un</li>
            <li>Reconstruire le dashboard progressivement</li>
          </ol>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#ffe5b4',
          borderRadius: '10px',
          border: '2px solid #ff9800'
        }}>
          <p style={{ color: '#e65100', margin: 0, fontWeight: 'bold' }}>
            ⚠️ Note : Ceci est un dashboard temporaire pour vérifier que React fonctionne.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmergencyDashboard