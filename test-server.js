// Teste simples do servidor
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./middleware/js/db');

const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Servidor funcionando!', port: port });
});

// Rota de teste para login
app.post('/api/users/login', (req, res) => {
    console.log('Teste de login recebido:', req.body);
    res.json({ message: 'Endpoint de login funcionando!', data: req.body });
});

// Inicia o servidor
async function startServer() {
    try {
        await connectToDatabase();
        app.listen(port, () => {
            console.log(`✅ Servidor de teste rodando em http://localhost:${port}`);
            console.log('Teste o endpoint: POST http://localhost:5000/api/users/login');
        });
    } catch (error) {
        console.error("❌ Falha ao iniciar o servidor:", error);
        process.exit(1);
    }
}

startServer();
