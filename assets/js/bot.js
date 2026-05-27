/**
 * LÓGICA DO CHATBOT VETPOCKET
 */
const botFlow = {
  step: 0,
  isProcessing: false,
  data: { nome: "", email: "", telefone: "", perfil: "" },
  questions: [
    "Olá! Sou o assistente virtual da VetPocket. 🐾 Com quem eu falo?",
    "Prazer, {nome}! Qual o seu melhor e-mail para contato?",
    "E o seu WhatsApp? (Prometo não mandar spam!)",
    "Para finalizar: qual o seu perfil de atendimento atual?",
  ],

  init() {
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
    const msg = document.createElement("div");
    msg.className = `msg-bubble ${type === "bot" ? "bot-msg" : "user-msg"}`;
    msg.innerHTML = text;
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
              "É opcional, mas agiliza bastante o nosso contato! 😊",
              "bot",
            );
            if (inputField)
              inputField.placeholder = "Whats ou Enter para pular...";
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
    if (area && input) {
      area.setAttribute("style", "display: flex !important;");
      document.getElementById("chat-options-area").style.display = "none";
      setTimeout(() => input.focus(), 300);
    }
  },

  showOptions() {
    document.getElementById("chat-input-area").style.display = "none";
    const optionsArea = document.getElementById("chat-options-area");
    optionsArea.style.display = "flex";
    optionsArea.innerHTML = `
            <button class="btn-chat-opt" onclick="botFlow.handleOption('homecare')">🏠 Só Homecare</button>
            <button class="btn-chat-opt" onclick="botFlow.handleOption('fixa')">🏥 Clínica Fixa</button>
            <button class="btn-chat-opt" onclick="botFlow.handleOption('misto')">🚀 Misto</button>
        `;
    this.scrollToBottom();
  },

  async handleOption(opt) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const labels = {
      homecare: "Só Homecare",
      fixa: "Clínica Fixa",
      misto: "Misto",
    };
    this.data.perfil = opt;
    this.appendMsg(labels[opt], "user");
    document.getElementById("chat-options-area").style.display = "none";

    this.showTyping();
    setTimeout(async () => {
      this.hideTyping();
      this.appendMsg("Perfeito! Estou processando seu cadastro... 🚀", "bot");
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
    } else if (this.step === 1) {
      if (!val) return;
      if (!val.includes("@") || !val.includes(".")) {
        this.appendMsg(
          "Hum, esse e-mail parece incompleto. Pode conferir?",
          "bot",
        );
        return;
      }
      this.appendMsg(val, "user");
      this.showTyping();

      try {
        const resp = await fetch(
          `${API_CONFIG.BASE_URL}save_lead.php?check_email=${val}`,
        );
        const result = await resp.json();
        this.hideTyping();
        if (result.exists) {
          this.appendMsg(
            "Ooops... este email já está cadastrado conosco, tente outro! 🐾",
            "bot",
          );
          input.value = "";
          return;
        }
        this.data.email = val;
      } catch (e) {
        this.hideTyping();
        console.error("Erro na verificação");
      }
    } else if (this.step === 2) {
      this.data.telefone = val || "Não informado";
      this.appendMsg(val || "Vou deixar em branco por enquanto.", "user");
    }

    input.value = "";
    this.step++;
    this.askNext();
  },

  async sendToPHP() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}save_lead.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.data),
      });
      const result = await response.json();

      if (result.status === "success" || result.status === "exists") {
        const perfilLabel =
          this.data.perfil === "homecare"
            ? "🏠 Só Homecare"
            : this.data.perfil === "fixa"
              ? "🏥 Clínica Fixa"
              : "🚀 Misto";
        const resumo = `<b>Parabéns, ${this.data.nome}! 🎉</b><br>Recebemos seu interesse. Confira seus dados:<br><br>📧 ${this.data.email}<br>📱 ${this.data.telefone}<br>🎯 ${perfilLabel}`;
        this.appendMsg(resumo, "bot");

        setTimeout(() => {
          this.showTyping();
          setTimeout(() => {
            this.hideTyping();
            if (result.ganhou_beneficio) {
              this.appendMsg(
                `Você garantiu uma das 10 vagas com 30% OFF! 🚀`,
                "bot",
              );
              this.mostrarBotaoFinal();
            } else {
              this.appendMsg(
                `As vagas com 30% OFF acabaram, mas você está na <b>Lista VIP</b>! 🐾`,
                "bot",
              );
            }
          }, 2000);
        }, 1500);
      }
    } catch (e) {
      this.hideTyping();
      this.appendMsg("Erro no servidor. Pode atualizar a página?", "bot");
    }
  },

  mostrarBotaoFinal() {
    const container = document.getElementById("chat-container");
    const btnDiv = document.createElement("div");
    btnDiv.style.textAlign = "center";
    btnDiv.style.padding = "15px 0";
    btnDiv.innerHTML = `
            <a href="" target="_blank"
               style="background: #6f42c1; color: white; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
               🔥 Aproveitar Desconto Agora
            </a>`;
    container.appendChild(btnDiv);
    this.scrollToBottom();
  },
};

/** https://pay.hotmart.com/VETHOME_CHECKOUT
 * GESTÃO GLOBAL DE EVENTOS
 */
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
    document.getElementById("waitlistModal").style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (e.target.closest("#chat-send-btn")) botFlow.handleInput();
});

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && document.activeElement.id === "chat-user-input") {
    botFlow.handleInput();
  }
});
