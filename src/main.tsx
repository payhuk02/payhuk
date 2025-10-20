import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // ⚠️ garde bien le chemin correct, sans `../`

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Assure-toi que c’est bien le même fichier importé

// Enregistrement du Service Worker (facultatif)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA est optionnelle
    });
  });
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      {/* ✅ Fournit i18n à toute l’application */}
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </React.StrictMode>
  );
} else {
  console.error("❌ Élément root introuvable dans le DOM.");
}
