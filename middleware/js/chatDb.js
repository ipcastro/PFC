// chatDb.js - Conexão específica para o database de chatbot
require('dotenv').config();
const mongoose = require('mongoose');

const chatUri = process.env.MONGO_URI || 'mongodb+srv://isacastro014:hqTCC3@cluster0.lpltg9p.mongodb.net/chatbot';
const chatDbName = 'chatbot';

// Função para conectar ao banco de dados do chatbot
async function connectToChatDatabase() {
    // Verificar se já existe uma conexão para o database de chat
    const existingConnection = mongoose.connections.find(conn => 
        conn.name === chatDbName && conn.readyState === 1
    );
    
    if (existingConnection) {
        console.log(`✅ Já conectado ao database de chat: ${chatDbName}`);
        return existingConnection;
    }

    try {
        // Criar uma nova conexão específica para o database de chat
        const chatConnection = await mongoose.createConnection(chatUri, {
            dbName: chatDbName,
        });
        
        console.log(`✅ Conectado ao MongoDB Atlas para chat, database: ${chatDbName}`);
        
        // Adicionar listeners para eventos de conexão
        chatConnection.on('error', err => {
            console.error('❌ Erro na conexão com database de chat:', err);
        });
        
        chatConnection.on('disconnected', () => {
            console.log('⚠️ Conexão com database de chat perdida');
        });
        
        return chatConnection;
    } catch (error) {
        console.error("❌ Erro ao conectar ao database de chat:", error);
        throw error;
    }
}

// Função para obter a conexão do chat
function getChatConnection() {
    const chatConnection = mongoose.connections.find(conn => 
        conn.name === chatDbName && conn.readyState === 1
    );
    
    if (!chatConnection) {
        throw new Error('Database de chat não conectado');
    }
    
    return chatConnection;
}

module.exports = { 
    connectToChatDatabase, 
    getChatConnection,
    chatDbName 
};
