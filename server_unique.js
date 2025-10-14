require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./middleware/js/db.js');
const { connectToChatDatabase } = require('./middleware/js/chatDb.js');
const Personagem = require('./models/personagem.model');
const Content = require('./models/content.model');
const Hq = require('./models/hq.model');
const Page = require('./models/pages.model');

// Criar instância do Express e Router
const app = express();
const router = express.Router();

// Configurar middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas do histórico de chat
router.get('/chat/historicos', async (req, res) => {
    try {
        const { SessaoChat } = require('./models/chat.model')();
        const sessoes = await SessaoChat.find({}).sort({ lastUpdated: -1 }).limit(50);
        res.json(sessoes);
    } catch (error) {
        console.error("Erro ao buscar históricos:", error);
        res.status(500).json({ error: "Erro ao buscar históricos." });
    }
});

// Rota para salvar histórico do chat
router.post('/chat/salvar-historico', async (req, res) => {
    try {
        const { sessionId, botId, userId, startTime, endTime, messages } = req.body;

        // Validar dados obrigatórios
        if (!sessionId || !botId || !userId || !messages) {
            return res.status(400).json({ 
                error: "Dados incompletos. sessionId, botId, userId e messages são obrigatórios." 
            });
        }

        const { SessaoChat } = require('./models/chat.model')();
        
        const novaSessao = new SessaoChat({
            sessionId,
            botId,
            userId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            messages,
            lastUpdated: new Date()
        });

        await novaSessao.save();

        res.status(201).json({ 
            message: "Histórico salvo com sucesso!",
            sessionId: novaSessao.sessionId
        });

    } catch (error) {
        console.error("Erro ao salvar histórico:", error);
        res.status(500).json({ error: "Erro ao salvar histórico: " + error.message });
    }
});

// Rotas de Personagens
router.post('/personagens', async (req, res) => {
    try {
        const novoPersonagemData = req.body;
        if (!novoPersonagemData.nome || !novoPersonagemData.descricao) {
            return res.status(400).json({ message: "Nome e descrição são obrigatórios." });
        }
        const result = await Personagem.createPersonagem(novoPersonagemData);
        res.status(201).json({ 
            message: "Personagem criado com sucesso!", 
            insertedId: result.insertedId, 
            data: novoPersonagemData 
        });
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar personagem." });
    }
});

router.get('/personagens', async (req, res) => {
    try {
        const personagens = await Personagem.getAllPersonagens();
        res.status(200).json(personagens);
    } catch (error) {
        console.error("Erro ao buscar personagens:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar personagens." });
    }
});

router.get('/personagens/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const personagem = await Personagem.getPersonagemById(id);
        if (!personagem) {
            return res.status(404).json({ message: "Personagem não encontrado." });
        }
        res.status(200).json(personagem);
    } catch (error) {
        if (error.message.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters")) {
            return res.status(400).json({ message: "ID inválido." });
        }
        console.error("Erro ao buscar personagem por ID:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar personagem." });
    }
});

router.put('/personagens/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio para atualização." });
        }

        const result = await Personagem.updatePersonagem(id, updateData);
        if (!result) {
            return res.status(400).json({ message: "ID inválido fornecido." });
        }
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Personagem não encontrado para atualização." });
        }
        res.status(200).json({ message: "Personagem atualizado com sucesso!", id });
    } catch (error) {
        console.error("Erro ao atualizar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar personagem." });
    }
});

router.delete('/personagens/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Personagem.deletePersonagem(id);

        if (!result) {
            return res.status(400).json({ message: "ID inválido fornecido." });
        }
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Personagem não encontrado para exclusão." });
        }
        res.status(200).json({ message: "Personagem excluído com sucesso!", id });
    } catch (error) {
        console.error("Erro ao deletar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar personagem." });
    }
});

// Rotas de Conteúdo
router.get('/content', async (req, res) => {
    try {
        const content = await Content.getContent();
        if (!content) {
            return res.status(404).json({ message: "Conteúdo não encontrado." });
        }
        res.status(200).json(content);
    } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar conteúdo." });
    }
});

router.post('/content', async (req, res) => {
    try {
        const contentData = req.body;
        if (Object.keys(contentData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        const savedContent = await Content.saveContent(contentData);
        res.status(201).json({ message: "Conteúdo salvo com sucesso!", data: savedContent });
    } catch (error) {
        console.error("Erro ao salvar conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao salvar conteúdo." });
    }
});

// Rota de Logs
router.post('/log-connection', async (req, res) => {
    try {
        const { acao, nomeBot } = req.body;
        
        if (!acao || !nomeBot) {
            return res.status(400).json({ 
                message: "acao e nomeBot são obrigatórios." 
            });
        }

        const { LogAcesso } = require('./models/chat.model')();
        
        const novoLog = new LogAcesso({
            col_acao: acao,
            col_nome_bot: nomeBot,
            col_data: new Date().toLocaleDateString(),
            col_hora: new Date().toLocaleTimeString(),
            col_IP: req.ip || req.connection.remoteAddress
        });

        await novoLog.save();
        
        res.status(200).json({ 
            message: "Log registrado com sucesso!",
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Erro ao registrar log:", error);
        res.status(500).json({ 
            message: "Erro interno do servidor ao registrar log." 
        });
    }
});

// Rota de Ranking
router.post('/ranking/registrar-acesso-bot', async (req, res) => {
    try {
        const { botId, nomeBot } = req.body;
        
        if (!botId || !nomeBot) {
            return res.status(400).json({ 
                message: "botId e nomeBot são obrigatórios." 
            });
        }

        // Aqui você pode adicionar a lógica para salvar no banco de dados
        // Por enquanto vamos apenas registrar o acesso
        console.log(`Acesso registrado para bot ${nomeBot} (${botId})`);
        
        res.status(200).json({ 
            message: "Acesso registrado com sucesso!",
            botId,
            nomeBot,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Erro ao registrar acesso do bot:", error);
        res.status(500).json({ 
            message: "Erro interno do servidor ao registrar acesso." 
        });
    }
});

// Rotas de HQ
router.get('/hq', async (req, res) => {
    try {
        const hq = await Hq.getHq();
        if (!hq) {
            return res.status(404).json({ message: "HQ não encontrada." });
        }
        res.status(200).json(hq);
    } catch (error) {
        console.error("Erro ao buscar HQ:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar HQ." });
    }
});

// ... (outras rotas de HQ e Pages seguem o mesmo padrão)

// Montar o roteador na aplicação
app.use('/api', router);

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
        // Conectar aos bancos de dados
        await Promise.all([
            connectToDatabase(),
            connectToChatDatabase()
        ]);

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`✅ Servidor rodando em http://localhost:${port}`);
        });
    } catch (error) {
        console.error("❌ Falha ao iniciar o servidor:", error);
        process.exit(1);
    }
}

startServer();