const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Campos do sistema antigo (admin/editor)
    username: {
        type: String,
        unique: true,
        sparse: true, // Permite valores nulos para campos únicos
        trim: true,
        minlength: [3, 'Nome de usuário deve ter pelo menos 3 caracteres']
    },
    password: {
        type: String,
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['admin', 'editor'],
        default: 'editor'
    },
    
    // Campos do sistema novo (cadastro público)
    nome: {
        type: String,
        trim: true
    },
    sobrenome: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Permite valores nulos para campos únicos
        trim: true,
        lowercase: true
    },
    senha: {
        type: String,
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    // Hash da senha do sistema antigo (password)
    if (this.isModified('password') && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    
    // Hash da senha do sistema novo (senha)
    if (this.isModified('senha') && this.senha) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.senha = await bcrypt.hash(this.senha, salt);
        } catch (error) {
            return next(error);
        }
    }
    
    next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Tenta comparar com password (sistema antigo)
        if (this.password) {
            return await bcrypt.compare(candidatePassword, this.password);
        }
        // Tenta comparar com senha (sistema novo)
        if (this.senha) {
            return await bcrypt.compare(candidatePassword, this.senha);
        }
        return false;
    } catch (error) {
        throw error;
    }
};

// Usar o padrão dos outros modelos para evitar conflitos
// Verificar se o modelo já existe de forma mais robusta
let User;
if (mongoose.models.User) {
    User = mongoose.models.User;
} else {
    User = mongoose.model('User', userSchema);
}

module.exports = User; 
