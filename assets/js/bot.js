/**
 * LÓGICA DO CHATBOT VETPOCKET - MIYA-KO
 * VERSÃO SIMPLIFICADA E FUNCIONAL
 */
const botFlow = {
  step: 0,
  isProcessing: false,
  data: { nome: "", email: "", telefone: "", perfil: "" },
  questions: [
    "🐾 Olá! Sou a Miya-ko, assistente virtual da VetPocket! 😊<br><br>Como posso chamar você?",
    "Prazer em te conhecer, {nome}! 🐶<br><br>Qual o seu melhor e-mail para contato?",
    "📱 Agora, me conta seu WhatsApp para contato? (É opcional, mas agiliza muito!)",
  ],

  init() {
    console.log("🚀 Inicializando chat da Miya-ko...");
    this.step = 0;
    this.isProcessing = false;
    this.data = { nome: "", email: "", telefone: "", perfil: "" };

    const container = document.getElementById("chat-container");
    const inputArea = document.getElementById("chat-input-area");
    const optionsArea = document.getElementById("chat-options-area");

    if (container) {
      container.innerHTML = "";
      if (inputArea) inputArea.style.display = "none";
      if (optionsArea) optionsArea.style.display = "none";
      this.fazerPergunta();
    }
  },

  mostrarDigitando() {
    const container = document.getElementById("chat-container");
    if (!container) return;
    
    const existingTyping = document.getElementById("typing-id");
    if (existingTyping) existingTyping.remove();
    
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
      msg.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <img src="assets/img/Miya-Ko_original_mascote.webp" alt="Miya-ko" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
          <div style="flex: 1;">${text}</div>
        </div>
      `;
    } else {
      msg.innerHTML = text;
    }
    
    container.appendChild(msg);
    this.scrollToBottom();
  },

  scrollToBottom() {
    const container = document.getElementById("chat-container");
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  },

  fazerPergunta() {
    const inputField = document.getElementById("chat-user-input");
    const inputArea = document.getElementById("chat-input-area");
    const optionsArea = document.getElementById("chat-options-area");

    if (inputArea) inputArea.style.display = "none";
    if (optionsArea) optionsArea.style.display = "none";
    
    this.mostrarDigitando();

    setTimeout(() => {
      this.esconderDigitando();
      
      let pergunta = this.questions[this.step].replace("{nome}", this.data.nome);
      this.appendMsg(pergunta, "bot");

      if (this.step === 2) {
        // Pergunta do WhatsApp - campo opcional
        if (inputField) inputField.placeholder = "WhatsApp (opcional) ou Enter para pular...";
        this.mostrarInput();
      } else if (this.step < 2) {
        // Perguntas de nome e email
        if (inputField) inputField.placeholder = "Digite sua resposta...";
        this.mostrarInput();
      }
      
      this.isProcessing = false;
    }, 1000);
  },

  mostrarInput() {
    const area = document.getElementById("chat-input-area");
    const input = document.getElementById("chat-user-input");
    const optionsArea = document.getElementById("chat-options-area");
    
    if (area && input) {
      area.style.display = "flex";
      if (optionsArea) optionsArea.style.display = "none";
      setTimeout(() => input.focus(), 200);
    }
  },

  mostrarOpcoesPerfil() {
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
    }
    this.scrollToBottom();
  },

  async escolherPerfil(perfil) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const labels = {
      homecare: "🏠 Só Homecare",
      fixa: "🏥 Clínica Fixa",
      misto: "🚀 Misto",
    };
    
    this.data.perfil = perfil;
    this.appendMsg(labels[perfil], "user");
    
    const optionsArea = document.getElementById("chat-options-area");
    if (optionsArea) optionsArea.style.display = "none";

    this.mostrarDigitando();
    setTimeout(async () => {
      this.esconderDigitando();
      this.appendMsg("🎉 Perfeito! Estou processando seu cadastro... Um momentinho! 🐾", "bot");
      await this.enviarParaPHP();
    }, 1000);
  },

  async processarInput() {
    if (this.isProcessing) return;
    
    const input = document.getElementById("chat-user-input");
    const valor = input.value.trim();

    // Step 0: Nome
    if (this.step === 0) {
      if (!valor) return;
      this.data.nome = valor;
      this.appendMsg(valor, "user");
      this.step++;
      this.fazerPergunta();
    } 
    // Step 1: Email
    else if (this.step === 1) {
      if (!valor) return;
      if (!valor.includes("@") || !valor.includes(".")) {
        this.appendMsg("🔍 Hum, esse e-mail parece incompleto... Pode conferir e digitar novamente? 🐾", "bot");
        input.value = "";
        return;
      }
      this.appendMsg(valor, "user");
      this.mostrarDigitando();

      try {
        const resp = await fetch(`${API_CONFIG.BASE_URL}save_lead.php?check_email=${encodeURIComponent(valor)}`);
        const result = await resp.json();
        this.esconderDigitando();
        
        if (result.exists) {
          this.appendMsg("😕 Ooops... este email já está cadastrado conosco! Quer tentar outro? 🐾", "bot");
          input.value = "";
          return;
        }
        this.data.email = valor;
        this.step++;
        this.fazerPergunta();
      } catch (e) {
        this.esconderDigitando();
        console.error("Erro na verificação:", e);
        this.appendMsg("⚠️ Erro ao verificar email. Por favor, tente novamente! 🙏", "bot");
        input.value = "";
      }
    } 
    // Step 2: WhatsApp (opcional) - após isso mostra opções de perfil
    else if (this.step === 2) {
      this.data.telefone = valor || "";
      this.appendMsg(valor || "⏩ Pular (vou deixar em branco por enquanto)", "user");
      this.step++;
      
      // Mostrar pergunta do perfil e opções
      this.mostrarDigitando();
      setTimeout(() => {
        this.esconderDigitando();
        this.appendMsg("🎯 Pra finalizar: qual o seu perfil de atendimento?", "bot");
        this.mostrarOpcoesPerfil();
      }, 1000);
    }

    input.value = "";
  },

  async atualizarBadgeVagas() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}save_lead.php?get_vagas=true&nocache=${Date.now()}`);
      const data = await response.json();
      const numVagas = parseInt(data.vagas_restantes);
      
      const badge = document.getElementById('badge-vagas');
      const vagasCounter = document.getElementById('vagas-counter');
      const vagasNumero = document.getElementById('vagas-numero');
      
      if (badge) {
        if (numVagas > 0) {
          const termoVerbo = numVagas === 1 ? "RESTA" : "RESTAM";
          const sufixoS = numVagas === 1 ? "" : "S";
          badge.innerHTML = `🔥 ${termoVerbo} <span id="num-vagas">${numVagas}</span> VAGA${sufixoS} COM 30% OFF`;
          badge.style.opacity = "1";
        } else {
          badge.innerHTML = "🎯 Lista VIP - Aguarde Novas Vagas";
          badge.style.cssText += "background: #6366f1 !important; opacity: 1 !important;";
        }
      }
      
      if (vagasCounter && vagasNumero && numVagas > 0) {
        vagasNumero.textContent = numVagas;
        vagasCounter.style.display = 'block';
      } else if (vagasCounter) {
        vagasCounter.style.display = 'none';
      }
      
      console.log(`✅ Badge atualizado: ${numVagas} vagas restantes`);
    } catch (e) {
      console.warn("Erro ao atualizar badge:", e);
    }
  },

  fecharChat() {
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      console.log("✅ Chat fechado");
    }
  },

  recarregarPagina() {
    console.log("🔄 Recarregando página para atualizar vagas...");
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  },

  async enviarParaPHP() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}save_lead.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.data),
      });
      
      const result = await response.json();

      if (result.status === "success") {
        const perfilLabel = this.data.perfil === "homecare" 
          ? "🏠 Só Homecare" 
          : this.data.perfil === "fixa" 
            ? "🏥 Clínica Fixa" 
            : "🚀 Misto";
        
        const resumo = `
          <div style="text-align: center;">
            <img src="assets/img/Miya-Ko_original_mascote.webp" alt="Miya-ko" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 10px;">
            <br>
            <b>Parabéns, ${this.data.nome}! 🎉</b>
          </div>
          <br>
          Recebemos seu interesse. Confira seus dados:<br><br>
          📧 ${this.data.email}<br>
          📱 ${this.data.telefone || "Não informado"}<br>
          🎯 ${perfilLabel}
        `;
        this.appendMsg(resumo, "bot");

        setTimeout(() => {
          this.mostrarDigitando();
          setTimeout(() => {
            this.esconderDigitando();
            
            if (result.ganhou_beneficio === true) {
              this.appendMsg(
                `🎉 <b>PARABÉNS! Você é um dos primeiros!</b> 🎉<br><br>` +
                `🐾 Você garantiu uma das vagas com <b>30% OFF</b> no plano vitalício! 🚀<br><br>` +
                `💚 Em breve nossa equipe entrará em contato.<br><br>` +
                `✨ Obrigada pelo interesse! 💜`,
                "bot"
              );
            } else {
              this.appendMsg(
                `💝 As vagas com 30% OFF se esgotaram, mas você está na <b>Lista VIP</b>! 😊<br><br>` +
                `🐾 Você receberá notificações sobre próximas oportunidades.<br><br>` +
                `✨ Obrigada pelo interesse! 💜`,
                "bot"
              );
            }
            
            setTimeout(async () => {
              await this.atualizarBadgeVagas();
              this.fecharChat();
              this.recarregarPagina();
            }, 4000);
            
          }, 2000);
        }, 1500);
      } 
      else if (result.status === "exists") {
        this.appendMsg(
          "📋 Este e-mail já está cadastrado em nossa lista! 💜<br><br>Obrigada pelo interesse! 🐾",
          "bot"
        );
        setTimeout(() => {
          this.fecharChat();
        }, 3000);
      } 
      else {
        this.appendMsg(
          "❌ Ops! Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente! 🐾",
          "bot"
        );
      }
    } catch (e) {
      this.esconderDigitando();
      console.error("Erro no envio:", e);
      this.appendMsg(
        "❌ Erro de conexão com o servidor. Por favor, recarregue a página e tente novamente. 🐾",
        "bot"
      );
    }
  }
};

// ============================================
// EVENTOS GLOBAIS
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
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  if (e.target.closest("#chat-send-btn")) {
    botFlow.processarInput();
  }
});

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && document.activeElement.id === "chat-user-input") {
    botFlow.processarInput();
  }
});

console.log("✅ Chat da Miya-ko carregado com sucesso!");