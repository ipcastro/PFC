const express = require('express');
const router = express.Router();
const getUserModel = require('../models/user.model');
const User = getUserModel();

// Criar novo usuário (apenas admin)
router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Nome de usuário já existe' });
        }

        // Criar novo usuário
        const user = new User({
            username,
            password,
            role: role || 'editor'
        });

        await user.save();

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor: ' + error.message });
    }
});

// Listar todos os usuários (apenas admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Obter usuário específico (apenas admin)
router.get('/:id', async (req, res) => {
    try {
        // Verificar se o ID é um ObjectId válido
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar usuário (apenas admin)
router.put('/:id', async (req, res) => {
    try {
        // Verificar se o ID é um ObjectId válido
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        
        const { username, password, role } = req.body;
        const updateData = {};

        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({
            message: 'Usuário atualizado com sucesso',
            user
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Excluir usuário (apenas admin)
router.delete('/:id', async (req, res) => {
    try {
        // Verificar se o ID é um ObjectId válido
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido' });
        }
        
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router; 