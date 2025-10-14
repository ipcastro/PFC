const getChatModels = require('../models/chat.model');

// Função para obter os modelos de chat
function getModels() {
    return getChatModels();
}

// Log de acesso ao chatbot
const logConnection = async (req, res) => {
    try {
        const { LogAcesso } = getModels();
        const { acao, nomeBot } = req.body;
        const ip = req.ip || 'IP não detectado';
        
        if (!acao || !nomeBot) {
            return res.status(400).json({ error: "Dados de log incompletos." });
        }

        if (!LogAcesso) {
            console.warn("⚠️ Database de chat não disponível, log não salvo");
            return res.status(201).json({ success: true, message: "Log registrado (modo compatibilidade)." });
        }

        const agora = new Date();
        const logEntry = new LogAcesso({
            col_data: agora.toISOString().split('T')[0],
            col_hora: agora.toTimeString().split(' ')[0],
            col_IP: ip,
            col_nome_bot: nomeBot,
            col_acao: acao
        });

        await logEntry.save();
        console.log('[Chat] Log de acesso gravado:', logEntry.toObject());
        res.status(201).json({ success: true, message: "Log registrado." });
    } catch (error) {
        console.error("Erro ao registrar log:", error);
        res.status(500).json({ error: true, message: "Erro ao registrar log." });
    }
};

// Ranking de bots (compatibilidade com sistema antigo)
let dadosRankingVitrine = [];

const registrarAcessoBot = (req, res) => {
    const { botId, nomeBot } = req.body;
    if (!botId || !nomeBot) {
        return res.status(400).json({ error: "ID e Nome do Bot são obrigatórios." });
    }
    const agora = new Date();
    const botExistente = dadosRankingVitrine.find(b => b.botId === botId);
    if (botExistente) {
        botExistente.contagem++;
        botExistente.ultimoAcesso = agora;
    } else {
        dadosRankingVitrine.push({ botId, nomeBot, contagem: 1, ultimoAcesso: agora });
    }
    res.status(201).json({ message: `Acesso ao bot ${nomeBot} registrado.` });
};

const visualizarRanking = (req, res) => {
    const rankingOrdenado = [...dadosRankingVitrine].sort((a, b) => b.contagem - a.contagem);
    res.json(rankingOrdenado);
};

// Salvar histórico de chat
const salvarHistorico = async (req, res) => {
    try {
        console.log("📥 Recebido request para salvar histórico:", {
            body: req.body,
            sessionId: req.body.sessionId,
            botId: req.body.botId
        });

        const { SessaoChat } = getModels();
        if (!SessaoChat) {
            console.error("❌ Modelo SessaoChat não disponível");
            return res.status(500).json({ error: "Database não está conectado" });
        }

        const { sessionId, botId, startTime, endTime, messages, userId } = req.body;
        
        if (!sessionId || !botId) {
            console.error("❌ Dados incompletos:", { sessionId, botId });
            return res.status(400).json({ error: "Dados incompletos." });
        }

        if (!SessaoChat) {
            console.warn("⚠️ Database de chat não disponível, histórico não salvo");
            return res.status(201).json({ 
                success: true, 
                message: "Histórico salvo (modo compatibilidade).", 
                sessionId 
            });
        }

        // Se não vier mensagens, inicializa vazio
        const msgs = Array.isArray(messages) ? messages : [];

        const sessaoData = {
            sessionId,
            userId: userId || 'anonimo',
            botId,
            startTime: startTime ? new Date(startTime) : new Date(),
            endTime: endTime ? new Date(endTime) : new Date(),
            messages: msgs,
            lastUpdated: new Date()
        };

        const result = await SessaoChat.findOneAndUpdate(
            { sessionId },
            sessaoData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ 
            success: true, 
            message: "Histórico salvo.", 
            sessionId,
            data: result 
        });
    } catch (error) {
        console.error("Erro ao salvar histórico:", error);
        res.status(500).json({ error: "Erro ao salvar histórico." });
    }
};

// Buscar históricos de chat
const buscarHistoricos = async (req, res) => {
    try {
        // Verificar se o banco de dados está disponível
        const { SessaoChat } = getModels();
        
        if (!SessaoChat) {
            // Modo compatibilidade - retornar array vazio
            console.warn("⚠️ Database de chat não disponível, retornando array vazio");
            return res.json([]);
        }
        
        const { userId, limit = 50, page = 1 } = req.query;
        
        let query = {};
        if (userId && userId !== 'anonimo') {
            query.userId = userId;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const sessoes = await SessaoChat.find(query)
            .sort({ lastUpdated: -1 })
            .limit(parseInt(limit))
            .skip(skip);
            
        const total = await SessaoChat.countDocuments(query);
        
        res.json({
            success: true,
            data: sessoes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Erro ao buscar históricos:", error);
        // Em caso de erro, retornar array vazio para compatibilidade
        res.json([]);
    }
};

// Buscar histórico específico por sessionId
const buscarHistoricoPorId = async (req, res) => {
    try {
        const { SessaoChat } = getModels();
        const { sessionId } = req.params;
        
        const sessao = await SessaoChat.findOne({ sessionId });
        
        if (!sessao) {
            return res.status(404).json({ error: "Sessão não encontrada." });
        }
        
        res.json({
            success: true,
            data: sessao
        });
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
};

// Deletar histórico específico
const deletarHistorico = async (req, res) => {
    try {
        const { SessaoChat } = getModels();
        const { sessionId } = req.params;
        
        const result = await SessaoChat.findOneAndDelete({ sessionId });
        
        if (!result) {
            return res.status(404).json({ error: "Sessão não encontrada." });
        }
        
        res.json({
            success: true,
            message: "Histórico deletado com sucesso."
        });
    } catch (error) {
        console.error("Erro ao deletar histórico:", error);
        res.status(500).json({ error: "Erro ao deletar histórico." });
    }
};

// Estatísticas do chatbot
const getEstatisticas = async (req, res) => {
    try {
        const { LogAcesso, SessaoChat } = getModels();
        
        const totalAcessos = await LogAcesso.countDocuments();
        const totalSessoes = await SessaoChat.countDocuments();
        const sessoesAtivas = await SessaoChat.countDocuments({
            endTime: { $exists: false }
        });
        
        // Bot mais acessado
        const botMaisAcessado = await LogAcesso.aggregate([
            { $group: { _id: "$col_nome_bot", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        
        res.json({
            success: true,
            data: {
                totalAcessos,
                totalSessoes,
                sessoesAtivas,
                botMaisAcessado: botMaisAcessado[0] || null
            }
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: "Erro ao buscar estatísticas." });
    }
};

module.exports = {
    logConnection,
    registrarAcessoBot,
    visualizarRanking,
    salvarHistorico,
    buscarHistoricos,
    buscarHistoricoPorId,
    deletarHistorico,
    getEstatisticas
};
