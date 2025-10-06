require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectToDatabase } = require('./middleware/js/db');

// Routers
const userRoutes = require('./routes/userRoutes');
const personagensRouter = require('./routes/personagem.routes');
const contentRouter = require('./routes/content.route');
const hqRouter = require('./routes/hq.route');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas API
app.use('/api/users', userRoutes);
app.use('/api/personagens', personagensRouter);
app.use('/api/content', contentRouter);
app.use('/api/hq', hqRouter);

// Arquivos estáticos (se necessário)
app.use(express.static('public'));

// Rota raiz simples
app.get('/', (req, res) => {
  res.send('API Node.js com MongoDB está funcionando!');
});

// Download protegido de PDF (opcionalmente usado apenas no server tradicional)
// Nota: manter aqui para compatibilidade; em Vercel, servir arquivos estáticos grandes não é recomendado
// mas a rota segue disponível caso haja armazenamento adequado.
app.get('/api/download/pdf', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    let token = null;
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) token = auth.substring('Bearer '.length).trim();
    if (!token && req.query && req.query.token) token = String(req.query.token);
    if (!token) return res.status(401).json({ message: 'Não autenticado' });
    const secret = process.env.JWT_SECRET || 'seu_jwt_secret_aqui_123456789';
    jwt.verify(token, secret);

    const file = String(req.query.file || '');
    if (!file || !file.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Arquivo inválido' });
    }
    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      return res.status(400).json({ message: 'Caminho inválido' });
    }
    const pdfDir = path.join(__dirname, 'pdf');
    const absPath = path.join(pdfDir, file);
    return res.sendFile(absPath, (err) => {
      if (err) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou erro no download' });
  }
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint não encontrado.' });
});

// Erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
});

// Nota: a conexão é inicializada pelo bootstrap (server.js) em ambiente local
// e no entry da função serverless (api/index.js) para evitar conexões duplicadas.

module.exports = app;


