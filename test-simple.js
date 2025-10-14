// Teste simples das rotas
const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Rota de teste simples
app.post('/api/log-connection', (req, res) => {
    console.log('✅ Rota /api/log-connection funcionando');
    res.json({ success: true, message: "Log registrado." });
});

app.post('/api/ranking/registrar-acesso-bot', (req, res) => {
    console.log('✅ Rota /api/ranking/registrar-acesso-bot funcionando');
    res.json({ message: "Acesso registrado." });
});

app.get('/api/ranking/visualizar', (req, res) => {
    console.log('✅ Rota /api/ranking/visualizar funcionando');
    res.json([]);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🧪 Servidor de teste rodando na porta ${PORT}`);
    console.log('Teste as rotas:');
    console.log(`POST http://localhost:${PORT}/api/log-connection`);
    console.log(`POST http://localhost:${PORT}/api/ranking/registrar-acesso-bot`);
    console.log(`GET http://localhost:${PORT}/api/ranking/visualizar`);
});
