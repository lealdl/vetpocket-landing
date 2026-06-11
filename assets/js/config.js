// assets/js/config.js

// Configuração DEFINITIVA - Usar backend remoto do provedor
const API_CONFIG = {
    // Sempre usa o backend do provedor (tanto local quanto produção)
    BASE_URL: "https://llrh.com.br/backend-landing/",
    
    FETCH_OPTIONS: {
        // REMOVENDO credentials para evitar conflito CORS
        // credentials: "include",  ← COMENTADO
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        mode: "cors"
    }
};

// Log para debug
console.log("🚀 API_CONFIG inicializado:");
console.log("📍 BACKEND URL:", API_CONFIG.BASE_URL);
console.log("📍 Ambiente Frontend:", window.location.hostname);

// Disponibilizar globalmente
window.API_CONFIG = API_CONFIG;