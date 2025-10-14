require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./middleware/js/db.js');

// Criar a instância do Express
const app = express();
const router = express.Router();

// Configurar middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota do histórico de chat
router.get('/chat/historicos', async (req, res) => {
    if (!SessaoChat) return res.status(503).json({ error: "DB não conectado." });
    try {
        const sessoes = await SessaoChat.find({}).sort({ lastUpdated: -1 }).limit(50);
        res.json(sessoes);
    } catch (error) {
        console.error("Erro ao buscar históricos:", error);
        res.status(500).json({ error: "Erro ao buscar históricos." });
    }
});

// Montar o roteador na aplicação
app.use('/api', router);

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota raiz
app.get('/', (req, res) => {
    res.send('API Node.js com MongoDB está funcionando!');
});

// Middleware 404
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint não encontrado." });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error("Erro não tratado:", err.stack);
    res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
});

// Iniciar o servidor
async function startServer() {
    try {
        await connectToDatabase();
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Falha ao iniciar o servidor:", error);
        process.exit(1);
    }
}

// Iniciar o servidor
startServer();