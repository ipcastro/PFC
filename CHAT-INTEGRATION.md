# Integração do Sistema de Chat

## Visão Geral

O sistema agora está integrado com dois databases MongoDB:

1. **Database Principal** (`fisica_divertida`) - Usuários, personagens, conteúdo, HQ
2. **Database de Chat** (`chatbot`) - Histórico de conversas e logs de acesso

## Estrutura dos Arquivos

### Novos Arquivos Criados

- `models/chat.model.js` - Modelos para histórico de chat
- `controllers/chatController.js` - Controller para gerenciar chat
- `routes/chat.routes.js` - Rotas da API de chat
- `middleware/js/chatDb.js` - Conexão específica para database de chat
- `test-chat-integration.js` - Teste de integração

### Arquivos Modificados

- `app.js` - Adicionadas rotas de chat
- `server.js` - Inicialização da conexão com database de chat

## Endpoints da API de Chat

### Base URL: `/api/chat`

#### 1. Log de Acesso
```http
POST /api/chat/log-connection
Content-Type: application/json

{
  "acao": "inicio_conversa",
  "nomeBot": "fisica-bot"
}
```

#### 2. Salvar Histórico
```http
POST /api/chat/salvar-historico
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "userId": "user123",
  "botId": "fisica-bot",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:30:00Z",
  "messages": [
    {
      "role": "user",
      "content": "Olá, como funciona a física?"
    },
    {
      "role": "bot",
      "content": "A física é o estudo da matéria e energia..."
    }
  ]
}
```

#### 3. Buscar Históricos
```http
GET /api/chat/historicos?userId=user123&limit=10&page=1
```

#### 4. Buscar Histórico Específico
```http
GET /api/chat/historico/session-id-123
```

#### 5. Deletar Histórico
```http
DELETE /api/chat/historico/session-id-123
```

#### 6. Estatísticas
```http
GET /api/chat/estatisticas
```

## Como Testar

1. **Executar o teste de integração:**
```bash
node test-chat-integration.js
```

2. **Iniciar o servidor:**
```bash
node server.js
```

3. **Testar endpoints:**
```bash
# Log de acesso
curl -X POST http://localhost:5000/api/chat/log-connection \
  -H "Content-Type: application/json" \
  -d '{"acao":"teste","nomeBot":"fisica-bot"}'

# Buscar estatísticas
curl http://localhost:5000/api/chat/estatisticas
```

## Estrutura do Database de Chat

### Collection: `tb_cl_user_log_acess`
```javascript
{
  col_data: "2024-01-01",
  col_hora: "10:00:00",
  col_IP: "127.0.0.1",
  col_nome_bot: "fisica-bot",
  col_acao: "inicio_conversa"
}
```

### Collection: `sessoesChat`
```javascript
{
  sessionId: "unique-session-id",
  userId: "user123",
  botId: "fisica-bot",
  startTime: Date,
  endTime: Date,
  messages: [
    {
      role: "user|bot",
      content: "Mensagem do usuário ou bot"
    }
  ],
  lastUpdated: Date
}
```

## Configuração

### Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
```

### Conexões

- **Database Principal**: Usa `MONGODB_URI` + `fisica_divertida`
- **Database de Chat**: Usa `MONGO_URI` + `chatbot`

## Funcionalidades Disponíveis

✅ **Log de Acesso** - Registrar quando usuários acessam o chatbot
✅ **Histórico de Conversas** - Salvar e recuperar conversas
✅ **Busca por Usuário** - Filtrar conversas por usuário
✅ **Paginação** - Suporte a paginação nas buscas
✅ **Estatísticas** - Dados sobre uso do chatbot
✅ **Múltiplas Conexões** - Dois databases independentes
✅ **Tratamento de Erros** - Middleware de verificação de conexão

## Próximos Passos

1. Integrar com o frontend para exibir histórico
2. Adicionar autenticação nas rotas de chat
3. Implementar notificações em tempo real
4. Adicionar métricas avançadas de uso
