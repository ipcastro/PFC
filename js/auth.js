// Funções de autenticação
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

function redirectToLogin(returnPath) {
    const currentPath = returnPath || window.location.pathname;
    localStorage.setItem('returnPath', currentPath);
    window.location.href = '/login.html';
}

function handleAuthenticatedRequest(callback) {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    return callback();
}

// Exportar funções para uso global
window.isAuthenticated = isAuthenticated;
window.redirectToLogin = redirectToLogin;
window.handleAuthenticatedRequest = handleAuthenticatedRequest;