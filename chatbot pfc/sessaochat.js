let sessionId = Date.now().toString();
let messages = [];
let botId = "quiz-cinematica";

// Formatação de data
function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcular duração da sessão
function calcularDuracao(startTime, endTime) {
    const inicio = new Date(startTime);
    const fim = new Date(endTime);
    const duracao = Math.floor((fim - inicio) / 1000); // duração em segundos
    
    if (duracao < 60) return `${duracao} segundos`;
    if (duracao < 3600) return `${Math.floor(duracao/60)} minutos`;
    return `${Math.floor(duracao/3600)} horas ${Math.floor((duracao%3600)/60)} minutos`;
}

// Salvar histórico
async function salvarHistorico() {
    if (messages.length === 0) return;
    
    try {
        const payload = {
            sessionId,
            botId,
            userId: 'anonimo',
            startTime: messages[0]?.timestamp || new Date(),
            endTime: new Date(),
            messages
        };
        
        const response = await fetch(`${API_CONFIG.API_BASE}${API_CONFIG.ENDPOINTS.SALVAR_HISTORICO}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Falha ao salvar histórico: ' + response.statusText);
        }
    } catch (err) {
        console.error("Falha ao salvar histórico:", err);
    }
}

// Carregar históricos
async function carregarHistoricoSessoes() {
    try {
        // Mostrar loading
        const lista = document.getElementById("lista-sessoes");
        lista.innerHTML = '<div class="loading">Carregando histórico...</div>';
        
        const resp = await fetch(`${API_CONFIG.API_BASE}${API_CONFIG.ENDPOINTS.HISTORICOS}`);
        if (!resp.ok) throw new Error("Falha ao buscar históricos: " + resp.statusText);
        
        const sessoes = await resp.json();
        lista.innerHTML = "";

        if (sessoes.length === 0) {
            lista.innerHTML = '<div class="no-history">Nenhum histórico encontrado</div>';
            return;
        }

        sessoes.forEach(sessao => {
            const li = document.createElement("li");
            li.className = "sessao-item";
            
            const dataFormatada = formatarData(sessao.startTime);
            const duracao = calcularDuracao(sessao.startTime, sessao.endTime);
            const numMensagens = sessao.messages?.length || 0;
            
            li.innerHTML = `
                <div class="sessao-header">
                    <div class="sessao-data">${dataFormatada}</div>
                    <div class="sessao-info">
                        <span class="sessao-duracao">⏱️ ${duracao}</span>
                        <span class="sessao-msgs">💬 ${numMensagens} mensagens</span>
                    </div>
                </div>
            `;
            
            li.onclick = () => mostrarDetalhes(sessao);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao carregar históricos:", err);
        document.getElementById("lista-sessoes").innerHTML = 
            '<div class="error">Erro ao carregar histórico. Tente novamente mais tarde.</div>';
    }
}

function mostrarDetalhes(sessao) {
    const container = document.getElementById("visualizacao-conversa-detalhada");
    const startTime = formatarData(sessao.startTime);
    const duracao = calcularDuracao(sessao.startTime, sessao.endTime);
    
    container.innerHTML = `
        <h3>
            <div>Conversa de ${startTime}</div>
            <button id="close-history-view">&times;</button>
        </h3>
        <div class="session-info">
            <span>⏱️ Duração: ${duracao}</span>
            <span>💬 ${sessao.messages.length} mensagens</span>
        </div>
        <div class="messages-container">
            ${sessao.messages.map(m => `
                <div class="message ${m.remetente === 'usuario' ? 'user-message' : 'bot-message'}">
                    <div class="message-header ${m.remetente}">
                        <div class="avatar">${m.remetente === 'usuario' ? 'U' : 'QC'}</div>
                        <span>${m.remetente === 'usuario' ? 'Você' : 'Quiz de Cinemática'}</span>
                    </div>
                    <div class="message-content">${m.texto}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Adicionar evento para fechar visualização
    document.getElementById('close-history-view').onclick = () => {
        container.style.display = "none";
    };
    
    container.style.display = "block";
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const historyButton = document.getElementById("load-history-button");
    if (historyButton) {
        historyButton.addEventListener("click", carregarHistoricoSessoes);
    }
    
    // Salvar histórico antes de sair da página
    window.addEventListener("beforeunload", salvarHistorico);
});

// Função para registrar mensagem
export function registrarMensagem(remetente, texto) {
    messages.push({ 
        remetente, 
        texto, 
        timestamp: new Date() 
    });
}
