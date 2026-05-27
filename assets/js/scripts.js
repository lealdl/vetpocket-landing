/**
 * LÓGICA DO CHATBOT VETHOME
 */
const botFlow = {
  step: 0,
  data: { nome: "", email: "", telefone: "", perfil: "" },
  questions: [
    "Olá! Sou o assistente virtual da VetPocket. 🐾 Com quem eu falo?",
    "Prazer, {nome}! Qual o seu melhor e-mail para contato?",
    "E o seu WhatsApp? (Prometo não mandar spam!)",
    "Para finalizar: qual o seu perfil de atendimento atual?",
  ],

  init() {
    this.step = 0;
    this.data = { nome: "", email: "", telefone: "", perfil: "" };
    const container = document.getElementById("chat-container");
    if (container) {
      container.innerHTML = "";
      this.askNext();
    }
  },

  appendMsg(text, type) {
    const container = document.getElementById("chat-container");
    const msg = document.createElement("div");
    msg.className = `msg-bubble ${type === "bot" ? "bot-msg" : "user-msg"}`;
    msg.innerHTML = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  },

  askNext() {
    let q = this.questions[this.step].replace("{nome}", this.data.nome);
    const inputField = document.getElementById("chat-user-input");

    setTimeout(() => {
      this.appendMsg(q, "bot");

      // Logica cordial para o WhatsApp Opcional
      if (this.step === 2) {
        setTimeout(() => {
          this.appendMsg(
            "É opcional, mas agiliza bastante o nosso contato! 😊",
            "bot",
          );
          if (inputField)
            inputField.placeholder = "Digite seu Whats ou Enter para pular...";
        }, 500);
      } else if (inputField) {
        inputField.placeholder = "Digite sua resposta...";
      }

      this.step === 3 ? this.showOptions() : this.showInput();
    }, 600);
  },

  showInput() {
    document.getElementById("chat-input-area").style.display = "flex";
    document.getElementById("chat-options-area").style.display = "none";
    document.getElementById("chat-user-input").focus();
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
  },

  async handleOption(opt) {
    const labels = {
      homecare: "Só Homecare",
      fixa: "Clínica Fixa",
      misto: "Misto",
    };
    this.data.perfil = opt;
    this.appendMsg(labels[opt], "user");
    document.getElementById("chat-options-area").style.display = "none";
    this.appendMsg("Perfeito! Estou processando seu cadastro... 🚀", "bot");
    await this.sendToPHP();
  },

  async handleInput() {
    const input = document.getElementById("chat-user-input");
    const val = input.value.trim();

    // 1. Validação de Nome (Passo 0)
    if (this.step === 0) {
      if (!val) return;
      this.data.nome = val;
      this.appendMsg(val, "user");
    }

    // 2. Validação de Email com Antecipação (Passo 1)
    else if (this.step === 1) {
      if (!val) return;

      // Validação básica de formato
      if (!val.includes("@") || !val.includes(".")) {
        this.appendMsg(
          "Hum, esse e-mail parece incompleto. Pode conferir?",
          "bot",
        );
        return;
      }

      this.appendMsg(val, "user");
      this.appendMsg("Deixa eu conferir se já te conheço... 🔍", "bot");

      try {
        const resp = await fetch(
          `${API_CONFIG.BASE_URL}save_lead.php?check_email=${val}`,
        );
        const result = await resp.json();

        if (result.exists) {
          setTimeout(() => {
            this.appendMsg(
              "Ooops... este email já está cadastrado conosco, tente outro! 🐾",
              "bot",
            );
          }, 500);
          input.value = "";
          return; // TRAVA O BOT AQUI
        }
        this.data.email = val;
      } catch (e) {
        console.error("Erro na verificação");
      }
    }

    // 3. Validação de Telefone Opcional (Passo 2)
    else if (this.step === 2) {
      if (!val) {
        this.data.telefone = "Não informado";
        this.appendMsg("Vou deixar em branco por enquanto.", "user");
      } else {
        this.data.telefone = val;
        this.appendMsg(val, "user");
      }
    }

    // Avança o fluxo
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
        // 1. RESUMO UNIVERSAL (Aparece para TODO MUNDO, inclusive o 11º)
        const perfilLabel =
          this.data.perfil === "homecare"
            ? "🏠 Só Homecare"
            : this.data.perfil === "fixa"
              ? "🏥 Clínica Fixa"
              : "🚀 Misto";

        const resumoDados = `
            <b>Parabéns, ${this.data.nome}! 🎉</b><br>
            Recebemos seu interesse no <b>VetPocket</b>. Confira seus dados:<br><br>
            📧 <b>E-mail:</b> ${this.data.email}<br>
            📱 <b>Whats:</b> ${this.data.telefone || "Não informado"}<br>
            🎯 <b>Perfil:</b> ${perfilLabel}
        `;

        this.appendMsg(resumoDados, "bot");

        // 2. CALCULA O TEMPO DE ESPERA (Baseado no tamanho do resumo + margem)
        const esperaParaProxima = Math.max(3000, resumoDados.length * 35);

        setTimeout(() => {
          // 3. AGORA SIM O BOT DECIDE O DESTINO
          if (result.ganhou_beneficio === true) {
            this.appendMsg(
              `Como você garantiu uma das 10 vagas com 30% OFF, recomendo finalizar agora!`,
              "bot",
            );
            this.mostrarBotaoFinal();
          } else {
            // CENÁRIO DO 11º (Onde estava dando erro)
            this.appendMsg(
              `Nossa, a procura foi gigante! As 10 vagas com 30% OFF acabaram de ser preenchidas. 😮`,
              "bot",
            );

            setTimeout(() => {
              this.appendMsg(
                "✅ Mas fique tranquilo: Seus dados estão salvos na nossa <b>Lista VIP</b>. Você terá prioridade total na próxima abertura! 🐾",
                "bot",
              );
            }, 2000);
          }
        }, esperaParaProxima);
      }
    } catch (e) {
      this.appendMsg(
        "Tive um probleminha no servidor, mas seus dados podem ter sido salvos. Pode atualizar a página?",
        "bot",
      );
    }
  },
}; // Fim do objeto botFlow

/**
 * GESTÃO GLOBAL DE EVENTOS
 */
document.addEventListener("click", (e) => {
  // 1. Abrir Modal de Interesse & Iniciar Bot
  if (e.target.closest(".abrir-modal")) {
    const modal = document.getElementById("waitlistModal");
    if (modal) {
      modal.style.display = "block";
      botFlow.init();
    }
  }

  // 2. Abrir Galeria
  if (e.target.closest(".abrir-demo")) {
    const modalDemo = document.getElementById("modal-demo");
    if (modalDemo) {
      modalDemo.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  // 3. Fechar Modais
  if (
    e.target.classList.contains("close-modal") ||
    e.target.id === "waitlistModal"
  ) {
    document.getElementById("waitlistModal").style.display = "none";
    document.body.style.overflow = "auto";
  }
  if (
    e.target.classList.contains("close-demo") ||
    e.target.id === "modal-demo"
  ) {
    document.getElementById("modal-demo").style.display = "none";
    document.body.style.overflow = "auto";
  }

  // 4. Botão de Envio do Chat
  if (e.target.closest("#chat-send-btn")) botFlow.handleInput();

  // 5. FAQ
  const questionBtn = e.target.closest(".faq-question");
  if (questionBtn) {
    const faqItem = questionBtn.parentElement;
    const isActive = faqItem.classList.contains("active");
    document
      .querySelectorAll(".faq-item")
      .forEach((item) => item.classList.remove("active"));
    if (!isActive) faqItem.classList.add("active");
  }
});

// Listener para tecla Enter no campo de input
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && document.activeElement.id === "chat-user-input") {
    botFlow.handleInput();
  }
});
