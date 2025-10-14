const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    sobrenome: {
        type: String,
        required: [true, 'Sobrenome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'user'],
        default: 'user'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Usar o padrão dos outros modelos para evitar conflitos
// Verificar se o modelo já existe de forma mais robusta
let User;

// Função para obter ou criar o modelo User
function getUserModel() {
    if (User) {
        return User;
    }
    
    try {
        if (mongoose.models.User) {
            User = mongoose.models.User;
        } else {
            User = mongoose.model('User', userSchema);
        }
    } catch (error) {
        // Se houver erro de modelo já compilado, usar o existente
        if (error.name === 'OverwriteModelError') {
            User = mongoose.models.User;
        } else {
            throw error;
        }
    }
    
    return User;
}

// Exportar a função em vez do modelo diretamente
module.exports = getUserModel; 