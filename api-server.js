const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log de conexões
app.post('/api/log-connection', (req, res) => {
    console.log('Nova conexão registrada:', new Date().toISOString());
    res.json({ status: 'ok' });
});

// Registro de acesso ao bot
app.post('/api/ranking/registrar-acesso-bot', (req, res) => {
    console.log('Novo acesso ao bot registrado:', new Date().toISOString());
    res.json({ status: 'ok' });
});

// Histórico de chats simulado
app.get('/api/chat/historicos', (req, res) => {
    // Dados simulados de histórico
    const historicos = [
        { id: 1, nome: "Sessão 1", data: "2025-10-08" },
        { id: 2, nome: "Sessão 2", data: "2025-10-08" },
        { id: 3, nome: "Sessão 3", data: "2025-10-08" }
    ];
    res.json(historicos);
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`API servidor rodando em http://localhost:${PORT}`);
});