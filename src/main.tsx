import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enregistrement du Service Worker (facultatif)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA est optionnelle
    });
  });
}

// Fonction pour initialiser l'application de manière asynchrone
const initializeApp = async () => {
  try {
    // Import dynamique d'i18n pour éviter les problèmes de contexte
    await import("../i18n");
    
    const root = document.getElementById("root");
    
    if (root) {
      createRoot(root).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      console.error("❌ Élément root introuvable dans le DOM.");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de l'application:", error);
    
    // Fallback : afficher une page d'erreur simple
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0f2a, #1a1f3a);
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 2rem;
        ">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Erreur de Chargement</h1>
          <p style="margin-bottom: 2rem; opacity: 0.8;">
            Une erreur s'est produite lors du chargement de l'application.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Recharger la page
          </button>
        </div>
      `;
    }
  }
};

// Initialiser l'application
initializeApp();
