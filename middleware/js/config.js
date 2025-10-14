// Detectar ambiente (desenvolvimento ou produção)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Configuração da API
const API_CONFIG = {
    // URL base da API - usando localhost em desenvolvimento
    API_BASE: isLocalhost ? 'http://localhost:5000' : 'https://pfc-nrpx.onrender.com',

    // Endpoints específicos
    ENDPOINTS: {
        REGISTER: '/api/users/register',
        LOGIN: '/api/users/login',
        CHAT: {
            LOG_CONNECTION: '/api/log-connection',
            RANKING: '/api/ranking/registrar-acesso-bot',
            HISTORICOS: '/api/chat/historicos',
            SALVAR_HISTORICO: '/api/chat/salvar-historico'
        }
    }
};

console.log("✅ Configurações carregadas:", { 
    ambiente: isLocalhost ? 'desenvolvimento' : 'produção',
    apiBase: API_CONFIG.API_BASE 
});

// Exportar para uso global
window.API_CONFIG = API_CONFIG;