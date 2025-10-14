// Teste de integração do sistema de chat
require('dotenv').config();
const { connectToDatabase } = require('./middleware/js/db');
const { connectToChatDatabase } = require('./middleware/js/chatDb');
const getChatModels = require('./models/chat.model');

async function testChatIntegration() {
    try {
        console.log('🧪 Iniciando teste de integração do chat...\n');
        
        // 1. Conectar aos databases
        console.log('1️⃣ Conectando ao database principal...');
        await connectToDatabase();
        console.log('✅ Database principal conectado\n');
        
        console.log('2️⃣ Conectando ao database de chat...');
        await connectToChatDatabase();
        console.log('✅ Database de chat conectado\n');
        
        // 2. Testar modelos de chat
        console.log('3️⃣ Testando modelos de chat...');
        const { LogAcesso, SessaoChat } = getChatModels();
        console.log('✅ Modelos de chat carregados\n');
        
        // 3. Testar criação de log de acesso
        console.log('4️⃣ Testando criação de log de acesso...');
        const testLog = new LogAcesso({
            col_data: new Date().toISOString().split('T')[0],
            col_hora: new Date().toTimeString().split(' ')[0],
            col_IP: '127.0.0.1',
            col_nome_bot: 'teste-bot',
            col_acao: 'teste-integracao'
        });
        
        await testLog.save();
        console.log('✅ Log de acesso criado com sucesso');
        console.log('   ID:', testLog._id);
        console.log('   Bot:', testLog.col_nome_bot);
        console.log('   Ação:', testLog.col_acao);
        console.log('');
        
        // 4. Testar criação de sessão de chat
        console.log('5️⃣ Testando criação de sessão de chat...');
        const testSession = new SessaoChat({
            sessionId: 'test-session-' + Date.now(),
            userId: 'test-user',
            botId: 'test-bot',
            startTime: new Date(),
            messages: [
                { role: 'user', content: 'Olá, este é um teste!' },
                { role: 'bot', content: 'Olá! Como posso ajudar?' }
            ]
        });
        
        await testSession.save();
        console.log('✅ Sessão de chat criada com sucesso');
        console.log('   Session ID:', testSession.sessionId);
        console.log('   User ID:', testSession.userId);
        console.log('   Mensagens:', testSession.messages.length);
        console.log('');
        
        // 5. Testar busca de dados
        console.log('6️⃣ Testando busca de dados...');
        const logsCount = await LogAcesso.countDocuments();
        const sessionsCount = await SessaoChat.countDocuments();
        
        console.log(`✅ Total de logs de acesso: ${logsCount}`);
        console.log(`✅ Total de sessões de chat: ${sessionsCount}`);
        console.log('');
        
        // 6. Limpeza dos dados de teste
        console.log('7️⃣ Limpando dados de teste...');
        await LogAcesso.deleteOne({ _id: testLog._id });
        await SessaoChat.deleteOne({ _id: testSession._id });
        console.log('✅ Dados de teste removidos');
        console.log('');
        
        console.log('🎉 Teste de integração concluído com sucesso!');
        console.log('✅ O sistema de chat está funcionando corretamente');
        
    } catch (error) {
        console.error('❌ Erro no teste de integração:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Fechar conexões
        process.exit(0);
    }
}

// Executar teste
testChatIntegration();
