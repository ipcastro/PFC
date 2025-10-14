// Configuração global da API
// Detectar se está rodando localmente ou em produção
const API_BASE = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname === '0.0.0.0'
    ? `http://${window.location.hostname}:5000` 
    : 'https://pfc-nrpx.onrender.com';

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE };
} else {
    window.API_BASE = API_BASE;
}

console.log('🔧 API_BASE configurada:', API_BASE);
