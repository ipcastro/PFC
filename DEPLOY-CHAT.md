# Deploy das Rotas de Chat

## Problema Identificado

O servidor de produção (`pfc-nrpx.onrender.com`) não possui as rotas de chat implementadas, causando erros 404 quando o sistema tenta acessar:

- `/api/chat/historicos`
- `/api/chat/salvar-historico`
- `/api/log-connection`
- `/api/ranking/registrar-acesso-bot`

## Solução Implementada

### 1. Configuração Dinâmica de API_BASE

Criado arquivo `js/api-config.js` que detecta automaticamente o ambiente:

```javascript
const API_BASE = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname === '0.0.0.0'
    ? `http://${window.location.hostname}:5000` 
    : 'https://pfc-nrpx.onrender.com';
```

### 2. Arquivos Atualizados

- ✅ `index.html` - Usa configuração dinâmica
- ✅ `chatbot pfc/sessaochat.js` - Usa API_BASE dinâmica
- ✅ `js/api-config.js` - Configuração centralizada

### 3. Para Resolver Completamente

**Opção A: Deploy das Rotas de Chat (Recomendado)**

1. Fazer deploy do código atualizado para o servidor de produção
2. As rotas de chat já estão implementadas no `app.js` e `routes/chat.routes.js`
3. O sistema funcionará automaticamente

**Opção B: Modo Compatibilidade (Atual)**

- Sistema funciona localmente com todas as funcionalidades
- Em produção, retorna respostas vazias mas não quebra
- Logs são "salvos" virtualmente

## Teste Local

1. Execute `node server.js` na porta 5000
2. Abra `test-api-config.html` no navegador
3. Verifique se a API está respondendo

## Estrutura das Rotas Implementadas

```
POST /api/log-connection
POST /api/ranking/registrar-acesso-bot
GET  /api/ranking/visualizar
POST /api/chat/salvar-historico
GET  /api/chat/historicos
GET  /api/chat/historico/:sessionId
DELETE /api/chat/historico/:sessionId
GET  /api/chat/estatisticas
```

## Status Atual

- ✅ **Local**: Funcionando perfeitamente
- ⚠️ **Produção**: Precisa de deploy das rotas de chat
- ✅ **Compatibilidade**: Sistema não quebra em produção
