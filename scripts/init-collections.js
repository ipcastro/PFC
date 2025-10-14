require('dotenv').config();
const mongoose = require('mongoose');
const { connectToChatDatabase } = require('../middleware/js/chatDb');

async function initializeCollections() {
    try {
        console.log('🔄 Inicializando coleções do banco de dados...');
        
        // Conectar ao banco de dados
        const chatConnection = await connectToChatDatabase();
        
        // Criar coleção de logs se não existir
        try {
            await chatConnection.createCollection('tb_cl_user_log_acess');
            console.log('✅ Coleção de logs criada com sucesso!');
        } catch (error) {
            if (error.code === 48) { // Código de erro quando a coleção já existe
                console.log('ℹ️ Coleção de logs já existe.');
            } else {
                throw error;
            }
        }
        
        // Criar coleção de sessões se não existir
        try {
            await chatConnection.createCollection('sessoesChat');
            console.log('✅ Coleção de sessões criada com sucesso!');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️ Coleção de sessões já existe.');
            } else {
                throw error;
            }
        }
        
        console.log('✅ Todas as coleções foram inicializadas!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao inicializar coleções:', error);
        process.exit(1);
    }
}

initializeCollections();