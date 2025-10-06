let sessionId = Date.now().toString();
let messages = [];
let botId = "quiz-cinematica";

// Salvar histórico
async function salvarHistorico() {
  try {
    await fetch("/api/chat/salvar-historico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        botId,
        startTime: messages[0]?.timestamp || new Date(),
        endTime: new Date(),
        messages
      })
    });
  } catch (err) {
    console.error("Falha ao salvar histórico:", err);
  }
}

// Carregar históricos
async function carregarHistoricoSessoes() {
  try {
    const resp = await fetch("/api/chat/historicos");
    if (!resp.ok) throw new Error("Falha ao buscar históricos: " + resp.statusText);
    const sessoes = await resp.json();
    const lista = document.getElementById("lista-sessoes");
    lista.innerHTML = "";

    sessoes.forEach(sessao => {
      const li = document.createElement("li");
      li.className = "sessao-item";
      li.textContent = `${sessao.sessionId} - ${new Date(sessao.startTime).toLocaleString()}`;
      li.onclick = () => mostrarDetalhes(sessao);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar históricos:", err);
  }
}

function mostrarDetalhes(sessao) {
  const container = document.getElementById("visualizacao-conversa-detalhada");
  container.innerHTML = `<h3>Histórico</h3>`;
  sessao.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = `[${m.remetente}] ${m.texto}`;
    container.appendChild(div);
  });
  container.style.display = "block";
}

// Evento no botão
document.getElementById("load-history-button").addEventListener("click", carregarHistoricoSessoes);

// Antes de sair da página
window.addEventListener("beforeunload", salvarHistorico);

// Função para registrar mensagem
export function registrarMensagem(remetente, texto) {
  messages.push({ remetente, texto, timestamp: new Date() });
}
