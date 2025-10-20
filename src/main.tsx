import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "../i18n"; // Import de la configuration i18n

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
