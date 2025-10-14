const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const getUserModel = require('../models/user.model');
const User = getUserModel();
const authMiddleware = require('../middleware/auth.middleware');

// Rota de registro de usuários
router.post('/register', async (req, res) => {
    try {
        const { nome, sobrenome, email, senha } = req.body;

        // Validar dados obrigatórios
        if (!nome || !sobrenome || !email || !senha) {
            return res.status(400).json({ 
                message: 'Todos os campos são obrigatórios' 
            });
        }

        // Verificar se email já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Este email já está cadastrado' 
            });
        }

        // Criar novo usuário
        const user = new User({
            nome,
            sobrenome,
            email,
            password: senha, // O campo no modelo é password
            role: 'user' // Papel padrão para novos usuários
        });

        await user.save();

        res.status(201).json({
            message: 'Cadastro realizado com sucesso! Redirecionando para o login...',
            userId: user._id
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor ao registrar usuário' 
        });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar dados de entrada
        if (!username || !password) {
            return res.status(400).json({ message: 'Por favor, forneça nome de usuário e senha' });
        }

        // Buscar usuário
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para verificar token (usado pelo frontend para validar sessão)
router.get('/verify', authMiddleware, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        }
    });
});

module.exports = router; 