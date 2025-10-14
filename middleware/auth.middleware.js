const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const authMiddleware = (req, res, next) => {
    try {
        // Pegar o token do cabeçalho Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // O token deve estar no formato "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        const [scheme, token] = parts;
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        // Verificar se o token é válido
        jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui_123456789', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }

            // Se o token for válido, salva o ID do usuário para uso nas rotas
            req.userId = decoded.id;
            return next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao processar autenticação' });
    }
};

module.exports = authMiddleware;