/**
 * LÓGICA DO CHATBOT VETPOCKET - MIYA-KO
 */
const botFlow = {
  step: 0,
  isProcessing: false,
  data: { nome: "", email: "", telefone: "", perfil: "" },
  questions: [
    "🐾 Olá! Sou a Miya-ko, assistente virtual da VetPocket! 😊<br><br>Como posso chamar você?",
    "Prazer em te conhecer, {nome}! 🐶<br><br>Qual o seu melhor e-mail para contato?",
    "📱 E o seu WhatsApp? (Prometo não mandar spam! É opcional, mas agiliza nosso contato)",
    "🎯 Para finalizar: qual o seu perfil de atendimento atual?",
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
      this.askNext();
    }
  },

  showTyping() {
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

  hideTyping() {
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

  askNext() {
    const inputField = document.getElementById("chat-user-input");
    const inputArea = document.getElementById("chat-input-area");

    if (inputArea) inputArea.style.display = "none";
    this.showTyping();

    const typingTime = Math.min(
      1800,
      Math.max(1000, this.questions[this.step].length * 30),
    );

    setTimeout(() => {
      this.hideTyping();
      let q = this.questions[this.step].replace("{nome}", this.data.nome);
      this.appendMsg(q, "bot");

      if (this.step === 2) {
        setTimeout(() => {
          this.showTyping();
          setTimeout(() => {
            this.hideTyping();
            this.appendMsg(
              "💡 Dica: Seu WhatsApp vai nos ajudar a te avisar sobre as novidades mais rápido! 📱",
              "bot",
            );
            if (inputField)
              inputField.placeholder = "WhatsApp ou Enter para pular...";
            this.showInput();
          }, 1000);
        }, 400);
      } else if (this.step === 3) {
        this.showOptions();
      } else {
        if (inputField) inputField.placeholder = "Digite sua resposta...";
        this.showInput();
      }
      this.isProcessing = false;
    }, typingTime);
  },

  showInput() {
    const area = document.getElementById("chat-input-area");
    const input = document.getElementById("chat-user-input");
    const optionsArea = document.getElementById("chat-options-area");
    
    if (area && input) {
      area.style.display = "flex";
      if (optionsArea) optionsArea.style.display = "none";
      setTimeout(() => input.focus(), 300);
    }
  },

  showOptions() {
    const inputArea = document.getElementById("chat-input-area");
    const optionsArea = document.getElementById("chat-options-area");
    
    if (inputArea) inputArea.style.display = "none";
    if (optionsArea) {
      optionsArea.style.display = "flex";
      optionsArea.innerHTML = `
        <button class="btn-chat-opt" onclick="botFlow.handleOption('homecare')">🏠 Só Homecare</button>
        <button class="btn-chat-opt" onclick="botFlow.handleOption('fixa')">🏥 Clínica Fixa</button>
        <button class="btn-chat-opt" onclick="botFlow.handleOption('misto')">🚀 Misto</button>
      `;
    }
    this.scrollToBottom();
  },

  async handleOption(opt) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const labels = {
      homecare: "🏠 Só Homecare",
      fixa: "🏥 Clínica Fixa",
      misto: "🚀 Misto",
    };
    
    this.data.perfil = opt;
    this.appendMsg(labels[opt], "user");
    
    const optionsArea = document.getElementById("chat-options-area");
    if (optionsArea) optionsArea.style.display = "none";

    this.showTyping();
    setTimeout(async () => {
      this.hideTyping();
      this.appendMsg("🎉 Perfeito! Estou processando seu cadastro... Um momentinho! 🐾", "bot");
      await this.sendToPHP();
    }, 1000);
  },

  async handleInput() {
    if (this.isProcessing) return;
    
    const input = document.getElementById("chat-user-input");
    const val = input.value.trim();

    if (this.step === 0) {
      if (!val) return;
      this.data.nome = val;
      this.appendMsg(val, "user");
      this.step++;
      this.askNext();
    } 
    else if (this.step === 1) {
      if (!val) return;
      if (!val.includes("@") || !val.includes(".")) {
        this.appendMsg(
          "🔍 Hum, esse e-mail parece incompleto... Pode conferir e digitar novamente? 🐾",
          "bot",
        );
        input.value = "";
        return;
      }
      this.appendMsg(val, "user");
      this.showTyping();

      try {
        const resp = await fetch(
          `${API_CONFIG.BASE_URL}save_lead.php?check_email=${encodeURIComponent(val)}`,
        );
        const result = await resp.json();
        this.hideTyping();
        
        if (result.exists) {
          this.appendMsg(
            "😕 Ooops... este email já está cadastrado conosco! Quer tentar outro? 🐾",
            "bot",
          );
          input.value = "";
          return;
        }
        this.data.email = val;
        this.step++;
        this.askNext();
      } catch (e) {
        this.hideTyping();
        console.error("Erro na verificação:", e);
        this.appendMsg("⚠️ Erro ao verificar email. Por favor, tente novamente! 🙏", "bot");
        input.value = "";
      }
    } 
    else if (this.step === 2) {
      this.data.telefone = val || "Não informado";
      this.appendMsg(val || "✅ Vou deixar em branco por enquanto.", "user");
      this.step++;
      this.askNext();
    }

    input.value = "";
  },

  async sendToPHP() {
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
          this.showTyping();
          setTimeout(() => {
            this.hideTyping();
            
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
            
            setTimeout(() => {
              this.fecharChat();
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
      this.hideTyping();
      console.error("Erro no envio:", e);
      this.appendMsg(
        "❌ Erro de conexão com o servidor. Por favor, recarregue a página e tente novamente. 🐾",
        "bot"
      );
    }
  },

  fecharChat() {
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      console.log("✅ Chat fechado");
    }
  }
};

// ============================================
// GESTÃO GLOBAL DE EVENTOS
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

  if (
    e.target.classList.contains("close-modal") ||
    e.target.id === "waitlistModal"
  ) {
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  if (e.target.closest("#chat-send-btn")) {
    botFlow.handleInput();
  }
});

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && document.activeElement.id === "chat-user-input") {
    botFlow.handleInput();
  }
});

console.log("✅ Chat da Miya-ko carregado com sucesso!");