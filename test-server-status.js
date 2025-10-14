// Teste do status do servidor
const http = require('http');

const testServer = (port = 5000) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/ranking/visualizar',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Servidor respondendo na porta ${port}`);
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Resposta:', data);
        });
    });

    req.on('error', (err) => {
        console.error(`❌ Servidor não está rodando na porta ${port}:`, err.message);
        console.log('💡 Execute: node server.js');
    });

    req.end();
};

// Testar portas comuns
console.log('🧪 Testando servidores...\n');
testServer(5000);
setTimeout(() => testServer(3000), 1000);
setTimeout(() => testServer(5501), 2000);
