const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Middleware opcional para verificar conexão com banco de dados
const checkDatabaseConnection = async (req, res, next) => {
    try {
        console.log("🔍 Verificando conexão com o banco de dados...");
        const { connectToChatDatabase } = require('../middleware/js/chatDb');
        
        // Tentar conectar ao banco
        await connectToChatDatabase();
        
        // Se conectou, obter os modelos
        const { LogAcesso, SessaoChat } = require('../models/chat.model')();
        req.chatModels = { LogAcesso, SessaoChat };
        
        console.log("✅ Conexão com banco de dados estabelecida");
        next();
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error);
        // Em modo de desenvolvimento, retornar erro detalhado
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ 
                error: "Erro na conexão com o banco de dados",
                details: error.message,
                stack: error.stack
            });
        }
        // Em produção, retornar mensagem genérica
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};

// Aplicar middleware em todas as rotas
router.use(checkDatabaseConnection);

// Log de acesso ao chatbot
router.post('/log-connection', chatController.logConnection);

// Ranking de bots (compatibilidade)
router.post('/ranking/registrar-acesso-bot', chatController.registrarAcessoBot);
router.get('/ranking/visualizar', chatController.visualizarRanking);

// Salvar histórico de chat
router.post('/salvar-historico', chatController.salvarHistorico);

// Buscar históricos de chat
router.get('/historicos', chatController.buscarHistoricos);

// Buscar histórico específico por sessionId
router.get('/historico/:sessionId', chatController.buscarHistoricoPorId);

// Deletar histórico específico
router.delete('/historico/:sessionId', chatController.deletarHistorico);

// Estatísticas do chatbot
router.get('/estatisticas', chatController.getEstatisticas);

module.exports = router;
