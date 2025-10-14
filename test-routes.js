// Teste das rotas de chat
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRoutes() {
    console.log('🧪 Testando rotas de chat...\n');
    
    try {
        // Teste 1: Log de conexão
        console.log('1️⃣ Testando /api/log-connection...');
        const logResponse = await axios.post(`${BASE_URL}/api/log-connection`, {
            acao: 'teste_integracao',
            nomeBot: 'teste-bot'
        });
        console.log('✅ Log de conexão:', logResponse.data);
        console.log('');
        
        // Teste 2: Ranking
        console.log('2️⃣ Testando /api/ranking/registrar-acesso-bot...');
        const rankingResponse = await axios.post(`${BASE_URL}/api/ranking/registrar-acesso-bot`, {
            botId: 'test-bot-123',
            nomeBot: 'Teste Bot'
        });
        console.log('✅ Ranking:', rankingResponse.data);
        console.log('');
        
        // Teste 3: Visualizar ranking
        console.log('3️⃣ Testando /api/ranking/visualizar...');
        const visualizarResponse = await axios.get(`${BASE_URL}/api/ranking/visualizar`);
        console.log('✅ Visualizar ranking:', visualizarResponse.data);
        console.log('');
        
        // Teste 4: Salvar histórico
        console.log('4️⃣ Testando /api/salvar-historico...');
        const historicoResponse = await axios.post(`${BASE_URL}/api/salvar-historico`, {
            sessionId: 'test-session-' + Date.now(),
            userId: 'test-user',
            botId: 'test-bot',
            messages: [
                { role: 'user', content: 'Teste de mensagem' },
                { role: 'bot', content: 'Resposta do bot' }
            ]
        });
        console.log('✅ Histórico salvo:', historicoResponse.data);
        console.log('');
        
        // Teste 5: Buscar históricos
        console.log('5️⃣ Testando /api/historicos...');
        const historicosResponse = await axios.get(`${BASE_URL}/api/historicos`);
        console.log('✅ Históricos encontrados:', historicosResponse.data.data.length);
        console.log('');
        
        // Teste 6: Estatísticas
        console.log('6️⃣ Testando /api/estatisticas...');
        const statsResponse = await axios.get(`${BASE_URL}/api/estatisticas`);
        console.log('✅ Estatísticas:', statsResponse.data);
        console.log('');
        
        console.log('🎉 Todos os testes passaram com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
        if (error.response?.status === 405) {
            console.error('❌ Erro 405 - Method Not Allowed. Verifique se as rotas estão configuradas corretamente.');
        }
    }
}

// Executar teste
testRoutes();
