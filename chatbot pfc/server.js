const express = require('express');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração da Conexão com Mongoose ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://seuusuario:suasenha@cluster.mongodb.net/quizDB";

let conn; // única conexão

// --- Definição dos Schemas e Models ---
const LogAcessoSchema = new mongoose.Schema({
    col_data: String,
    col_hora: String,
    col_IP: String,
    col_nome_bot: String,
    col_acao: String
}, { collection: 'tb_cl_user_log_acess' });

const SessaoChatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'anonimo' },
    botId: String,
    startTime: Date,
    endTime: Date,
    messages: [mongoose.Schema.Types.Mixed],
    lastUpdated: { type: Date, default: Date.now }
}, { collection: 'sessoesChat' });

let LogAcesso;
let SessaoChat;

// --- Função de Conexão ---
async function initializeDatabase() {
    if (!MONGO_URI) {
        console.error("❌ Nenhuma URI definida para o MongoDB.");
        return;
    }
    try {
        conn = await mongoose.createConnection(MONGO_URI).asPromise();
        console.log(`✅ Conectado ao MongoDB Atlas`);

        LogAcesso = conn.model('LogAcesso', LogAcessoSchema);
        SessaoChat = conn.model('SessaoChat', SessaoChatSchema);

    } catch (err) {
        console.error("❌ Erro ao conectar ao MongoDB:", err);
    }
}

// --- Middlewares ---
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.set('trust proxy', true);

// --- Rotas ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Log de acesso
app.post('/api/log-connection', async (req, res) => {
  if (!LogAcesso) return res.status(503).json({ error: "Serviço de log indisponível." });
  try {
    const { acao, nomeBot } = req.body;
    const ip = req.ip || 'IP não detectado';
    if (!acao || !nomeBot) return res.status(400).json({ error: "Dados de log incompletos." });

    const agora = new Date();
    const logEntry = new LogAcesso({
      col_data: agora.toISOString().split('T')[0],
      col_hora: agora.toTimeString().split(' ')[0],
      col_IP: ip,
      col_nome_bot: nomeBot,
      col_acao: acao
    });

    await logEntry.save();
    console.log('[Servidor] Log de acesso gravado:', logEntry.toObject());
    res.status(201).json({ success: true, message: "Log registrado." });
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao registrar log." });
  }
});

// Salvar histórico
app.post('/api/chat/salvar-historico', async (req, res) => {
    if (!SessaoChat) return res.status(503).json({ error: "DB não conectado." });
    try {
        const { sessionId, botId, startTime, endTime, messages } = req.body;
        if (!sessionId || !botId) {
            return res.status(400).json({ error: "Dados incompletos." });
        }

        // Se não vier mensagens, inicializa vazio
        const msgs = Array.isArray(messages) ? messages : [];

        const sessaoData = {
            sessionId,
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

        res.status(201).json({ success: true, message: "Histórico salvo.", sessionId });
    } catch (error) {
        console.error("Erro ao salvar histórico:", error);
        res.status(500).json({ error: "Erro ao salvar histórico." });
    }
});

// Buscar históricos
app.get('/api/chat/historicos', async (req, res) => {
    if (!SessaoChat) return res.status(503).json({ error: "DB não conectado." });
    try {
        const sessoes = await SessaoChat.find({}).sort({ lastUpdated: -1 }).limit(50);
        res.json(sessoes);
    } catch (error) {
        console.error("Erro ao buscar históricos:", error);
        res.status(500).json({ error: "Erro ao buscar históricos." });
    }
});

// Ranking (corrigido: variável declarada)
let dadosRankingVitrine = [];
app.post('/api/ranking/registrar-acesso-bot', (req, res) => { 
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
});

app.get('/api/ranking/visualizar', (req, res) => {
    const rankingOrdenado = [...dadosRankingVitrine].sort((a, b) => b.contagem - a.contagem);
    res.json(rankingOrdenado);
});

// Clima
app.post('/api/weather', async (req, res) => {
  try {
    const { location } = req.body;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: true, message: 'Chave não configurada.' });
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=pt_br`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erro ao obter dados meteorológicos';
    return res.status(status).json({ error: true, message });
  }
});

// Inicialização
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});
