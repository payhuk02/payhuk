import React from 'react';

// Composant de fallback simple sans dépendances externes
export const AppFallback = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f2a, #1a1f3a)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #3b82f6',
        borderTop: '4px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      
      <h1 style={{ 
        color: '#3b82f6', 
        marginBottom: '1rem',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Chargement de Payhuk...
      </h1>
      
      <p style={{ 
        marginBottom: '2rem', 
        opacity: 0.8,
        fontSize: '1rem'
      }}>
        Initialisation de l'application en cours
      </p>
      
      <button 
        onClick={() => window.location.reload()}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#2563eb'}
        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
      >
        Recharger la page
      </button>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
