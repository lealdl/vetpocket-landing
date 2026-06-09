/**
 * LÓGICA DO CHATBOT VETPOCKET - MIYA-KO
 * VERSÃO COM LOGS PARA DEBUG
 */
const botFlow = {
  step: 0,
  isProcessing: false,
  data: { nome: "", email: "", telefone: "", perfil: "" },

  init() {
    console.log("🚀 [1/10] Inicializando chat da Miya-ko...");
    this.step = 0;
    this.isProcessing = false;
    this.data = { nome: "", email: "", telefone: "", perfil: "" };

    const container = document.getElementById("chat-container");
    const inputArea = document.getElementById("chat-input-area");
    const optionsArea = document.getElementById("chat-options-area");

    if (container) {
      console.log("✅ [2/10] Container encontrado");
      container.innerHTML = "";
      if (inputArea) inputArea.style.display = "none";
      if (optionsArea) optionsArea.style.display = "none";
      
      console.log("✅ [3/10] Mostrando primeira mensagem");
      this.mostrarDigitando();
      setTimeout(() => {
        this.esconderDigitando();
        this.appendMsg("🐾 Olá! Sou a Miya-ko, assistente virtual da VetPocket! 😊<br><br>Como posso chamar você?", "bot");
        this.mostrarInput("Digite seu nome...");
      }, 1000);
    } else {
      console.error("❌ Container não encontrado!");
    }
  },

  mostrarDigitando() {
    const container = document.getElementById("chat-container");
    if (!container) return;
    const existing = document.getElementById("typing-id");
    if (existing) existing.remove();
    const typing = document.createElement("div");
    typing.id = "typing-id";
    typing.className = "typing-indicator bot-msg msg-bubble";
    typing.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(typing);
    this.scrollToBottom();
  },

  esconderDigitando() {
    const typing = document.getElementById("typing-id");
    if (typing) typing.remove();
  },

  appendMsg(text, type) {
    const container = document.getElementById("chat-container");
    if (!container) return;
    const msg = document.createElement("div");
    msg.className = `msg-bubble ${type === "bot" ? "bot-msg" : "user-msg"}`;
    if (type === "bot") {
      msg.innerHTML = `<div style="display: flex; align-items: flex-start; gap: 10px;">
        <img src="assets/img/Miya-Ko_original_mascote.webp" alt="Miya-ko" style="width: 35px; height: 35px; border-radius: 50%;">
        <div style="flex:1">${text}</div>
      </div>`;
    } else {
      msg.innerHTML = text;
    }
    container.appendChild(msg);
    this.scrollToBottom();
  },

  scrollToBottom() {
    const container = document.getElementById("chat-container");
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  },

  mostrarInput(placeholder) {
    console.log("📝 [mostrarInput] Chamado com placeholder:", placeholder);
    const area = document.getElementById("chat-input-area");
    const input = document.getElementById("chat-user-input");
    const optionsArea = document.getElementById("chat-options-area");
    if (area && input) {
      area.style.display = "flex";
      if (optionsArea) optionsArea.style.display = "none";
      input.placeholder = placeholder || "Digite sua resposta...";
      input.value = "";
      setTimeout(() => input.focus(), 200);
      console.log("✅ [mostrarInput] Input exibido");
    } else {
      console.error("❌ [mostrarInput] Area ou input não encontrado");
    }
  },

  mostrarOpcoesPerfil() {
    console.log("🎯 [mostrarOpcoesPerfil] Chamado");
    const inputArea = document.getElementById("chat-input-area");
    const optionsArea = document.getElementById("chat-options-area");
    if (inputArea) inputArea.style.display = "none";
    if (optionsArea) {
      optionsArea.style.display = "flex";
      optionsArea.innerHTML = `
        <button class="btn-chat-opt" onclick="botFlow.escolherPerfil('homecare')">🏠 Só Homecare</button>
        <button class="btn-chat-opt" onclick="botFlow.escolherPerfil('fixa')">🏥 Clínica Fixa</button>
        <button class="btn-chat-opt" onclick="botFlow.escolherPerfil('misto')">🚀 Misto</button>
      `;
      console.log("✅ [mostrarOpcoesPerfil] Opções exibidas");
    } else {
      console.error("❌ [mostrarOpcoesPerfil] OptionsArea não encontrado");
    }
    this.scrollToBottom();
  },

  async escolherPerfil(perfil) {
    console.log("🎯 [escolherPerfil] Perfil selecionado:", perfil);
    if (this.isProcessing) return;
    this.isProcessing = true;

    const labels = { homecare: "🏠 Só Homecare", fixa: "🏥 Clínica Fixa", misto: "🚀 Misto" };
    this.data.perfil = perfil;
    this.appendMsg(labels[perfil], "user");
    
    const optionsArea = document.getElementById("chat-options-area");
    if (optionsArea) optionsArea.style.display = "none";

    this.mostrarDigitando();
    setTimeout(() => {
      this.esconderDigitando();
      this.appendMsg("🎉 Perfeito! Estou processando seu cadastro... Um momentinho! 🐾", "bot");
      this.enviarParaPHP();
    }, 1000);
  },

  async processarInput() {
    console.log("⌨️ [processarInput] step atual:", this.step, "isProcessing:", this.isProcessing);
    
    if (this.isProcessing) {
      console.log("⚠️ [processarInput] Já processando, ignorando...");
      return;
    }
    this.isProcessing = true;
    
    const input = document.getElementById("chat-user-input");
    const valor = input.value.trim();
    console.log("📝 [processarInput] Valor digitado:", valor);

    // Step 0: Nome
    if (this.step === 0) {
      console.log("📝 [step 0] Processando nome...");
      if (!valor) { console.log("⚠️ Nome vazio"); this.isProcessing = false; return; }
      this.data.nome = valor;
      this.appendMsg(valor, "user");
      this.step = 1;
      console.log("📝 [step 0] Nome salvo:", this.data.nome, "step agora:", this.step);
      this.mostrarDigitando();
      setTimeout(() => {
        this.esconderDigitando();
        this.appendMsg(`Prazer em te conhecer, ${this.data.nome}! 🐶<br><br>Qual o seu melhor e-mail para contato?`, "bot");
        this.mostrarInput("Digite seu e-mail...");
        this.isProcessing = false;
        console.log("✅ [step 0] Pergunta de email exibida");
      }, 1000);
    } 
    // Step 1: Email
    else if (this.step === 1) {
      console.log("📝 [step 1] Processando email...");
      if (!valor) { console.log("⚠️ Email vazio"); this.isProcessing = false; return; }
      if (!valor.includes("@") || !valor.includes(".")) {
        console.log("⚠️ Email inválido");
        this.appendMsg("🔍 Hum, esse e-mail parece incompleto... Pode conferir e digitar novamente? 🐾", "bot");
        input.value = "";
        this.isProcessing = false;
        return;
      }
      this.appendMsg(valor, "user");
      this.mostrarDigitando();

      try {
        console.log("📡 [step 1] Verificando email no servidor...");
        const resp = await fetch(`${API_CONFIG.BASE_URL}save_lead.php?check_email=${encodeURIComponent(valor)}`);
        const result = await resp.json();
        this.esconderDigitando();
        console.log("📡 [step 1] Resposta do servidor:", result);
        
        if (result.exists) {
          console.log("⚠️ [step 1] Email já existe");
          this.appendMsg("😕 Ooops... este email já está cadastrado conosco! Quer tentar outro? 🐾", "bot");
          input.value = "";
          this.isProcessing = false;
          return;
        }
        this.data.email = valor;
        this.step = 2;
        console.log("✅ [step 1] Email salvo:", this.data.email, "step agora:", this.step);
        this.appendMsg("📱 Agora, me conta seu WhatsApp para contato? (É opcional, mas agiliza muito!)", "bot");
        this.mostrarInput("WhatsApp (opcional) ou Enter para pular...");
        this.isProcessing = false;
        console.log("✅ [step 1] Pergunta de WhatsApp exibida");
      } catch (e) {
        this.esconderDigitando();
        console.error("❌ [step 1] Erro na verificação:", e);
        this.appendMsg("⚠️ Erro ao verificar email. Tente novamente! 🙏", "bot");
        input.value = "";
        this.isProcessing = false;
      }
    } 
    // Step 2: WhatsApp (opcional)
    else if (this.step === 2) {
      console.log("📝 [step 2] Processando WhatsApp...");
      this.data.telefone = valor || "";
      this.appendMsg(valor || "⏩ Pular (vou deixar em branco por enquanto)", "user");
      this.step = 3;
      console.log("✅ [step 2] WhatsApp salvo:", this.data.telefone, "step agora:", this.step);
      this.mostrarDigitando();
      setTimeout(() => {
        this.esconderDigitando();
        this.appendMsg("🎯 Pra finalizar: qual o seu perfil de atendimento?", "bot");
        this.mostrarOpcoesPerfil();
        this.isProcessing = false;
        console.log("✅ [step 2] Pergunta de perfil exibida");
      }, 1000);
    } else {
      console.log("⚠️ [processarInput] step desconhecido:", this.step);
      this.isProcessing = false;
    }

    input.value = "";
  },

  async atualizarBadgeVagas() {
    console.log("📊 [atualizarBadgeVagas] Atualizando badge...");
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}save_lead.php?get_vagas=true&nocache=${Date.now()}`);
      const data = await response.json();
      const numVagas = parseInt(data.vagas_restantes);
      console.log("📊 [atualizarBadgeVagas] Vagas restantes:", numVagas);
      const badge = document.getElementById('badge-vagas');
      const vagasCounter = document.getElementById('vagas-counter');
      const vagasNumero = document.getElementById('vagas-numero');
      
      if (badge) {
        if (numVagas > 0) {
          const termoVerbo = numVagas === 1 ? "RESTA" : "RESTAM";
          const sufixoS = numVagas === 1 ? "" : "S";
          badge.innerHTML = `🔥 ${termoVerbo} <span id="num-vagas">${numVagas}</span> VAGA${sufixoS} COM 30% OFF`;
        } else {
          badge.innerHTML = "🎯 Lista VIP - Aguarde Novas Vagas";
        }
      }
      if (vagasCounter && vagasNumero && numVagas > 0) {
        vagasNumero.textContent = numVagas;
        vagasCounter.style.display = 'block';
      } else if (vagasCounter) {
        vagasCounter.style.display = 'none';
      }
      console.log("✅ [atualizarBadgeVagas] Badge atualizado");
    } catch (e) {
      console.warn("❌ [atualizarBadgeVagas] Erro:", e);
    }
  },

  fecharChat() {
    console.log("🚪 [fecharChat] Fechando chat...");
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      console.log("✅ [fecharChat] Chat fechado");
    }
  },

  async enviarParaPHP() {
    console.log("📤 [enviarParaPHP] Enviando dados para o servidor...");
    console.log("📤 Dados:", this.data);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}save_lead.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.data),
      });
      const result = await response.json();
      console.log("📤 [enviarParaPHP] Resposta:", result);

      if (result.status === "success") {
        const perfilLabel = this.data.perfil === "homecare" ? "🏠 Só Homecare" : this.data.perfil === "fixa" ? "🏥 Clínica Fixa" : "🚀 Misto";
        const resumo = `<div style="text-align:center"><img src="assets/img/Miya-Ko_original_mascote.webp" style="width:50px;height:50px;border-radius:50%;margin-bottom:10px"><br><b>Parabéns, ${this.data.nome}! 🎉</b></div><br>Recebemos seu interesse. Confira seus dados:<br><br>📧 ${this.data.email}<br>📱 ${this.data.telefone || "Não informado"}<br>🎯 ${perfilLabel}`;
        this.appendMsg(resumo, "bot");

        setTimeout(() => {
          this.mostrarDigitando();
          setTimeout(() => {
            this.esconderDigitando();
            if (result.ganhou_beneficio === true) {
              this.appendMsg(`🎉 <b>PARABÉNS! Você é um dos primeiros!</b> 🎉<br><br>🐾 Você garantiu uma das vagas com <b>30% OFF</b>! 🚀<br><br>💚 Em breve nossa equipe entrará em contato.<br><br>✨ Obrigada pelo interesse! 💜`, "bot");
            } else {
              this.appendMsg(`💝 As vagas com 30% OFF se esgotaram, mas você está na <b>Lista VIP</b>! 😊<br><br>🐾 Você receberá notificações sobre próximas oportunidades.<br><br>✨ Obrigada pelo interesse! 💜`, "bot");
            }
            setTimeout(async () => {
              await this.atualizarBadgeVagas();
              this.fecharChat();
              setTimeout(() => window.location.reload(), 2000);
            }, 4000);
          }, 2000);
        }, 1500);
      } else if (result.status === "exists") {
        this.appendMsg("📋 Este e-mail já está cadastrado em nossa lista! 💜<br><br>Obrigada pelo interesse! 🐾", "bot");
        setTimeout(() => this.fecharChat(), 3000);
      } else {
        this.appendMsg("❌ Ops! Ocorreu um erro. Tente novamente! 🐾", "bot");
      }
    } catch (e) {
      this.esconderDigitando();
      console.error("❌ [enviarParaPHP] Erro:", e);
      this.appendMsg("❌ Erro de conexão. Recarregue a página e tente novamente! 🐾", "bot");
    }
  }
};

// ============================================
// EVENTOS
// ============================================
document.addEventListener("click", (e) => {
  if (e.target.closest(".abrir-modal")) {
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
      setTimeout(() => botFlow.init(), 150);
    }
  }
  if (e.target.classList.contains("close-modal") || e.target.id === "waitlistModal") {
    const modal = document.getElementById("waitlistModal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
  if (e.target.closest("#chat-send-btn")) botFlow.processarInput();
});

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && document.activeElement.id === "chat-user-input") botFlow.processarInput();
});

console.log("✅ Chat da Miya-ko carregado com logs de debug!");