const mongoose = require('mongoose');
const { getChatConnection } = require('../middleware/js/chatDb');

// Schema para log de acesso do chatbot
const LogAcessoSchema = new mongoose.Schema({
    col_data: String,
    col_hora: String,
    col_IP: String,
    col_nome_bot: String,
    col_acao: String
}, { 
    collection: 'tb_cl_user_log_acess',
    timestamps: true 
});

// Schema para sessões de chat
const SessaoChatSchema = new mongoose.Schema({
    sessionId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    userId: { 
        type: String, 
        default: 'anonimo' 
    },
    botId: String,
    startTime: Date,
    endTime: Date,
    messages: [mongoose.Schema.Types.Mixed],
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    collection: 'sessoesChat',
    timestamps: true 
});

// Função para obter ou criar os modelos usando a conexão específica do chat
function getChatModels() {
    try {
        const chatConnection = getChatConnection();
        
        let LogAcesso, SessaoChat;
        
        // Verificar se os modelos já existem na conexão específica
        if (chatConnection.models.LogAcesso) {
            LogAcesso = chatConnection.models.LogAcesso;
        } else {
            LogAcesso = chatConnection.model('LogAcesso', LogAcessoSchema);
        }
        
        if (chatConnection.models.SessaoChat) {
            SessaoChat = chatConnection.models.SessaoChat;
        } else {
            SessaoChat = chatConnection.model('SessaoChat', SessaoChatSchema);
        }
        
        return { LogAcesso, SessaoChat };
    } catch (error) {
        console.error("Erro ao obter modelos de chat:", error);
        throw error;
    }
}

module.exports = getChatModels;
