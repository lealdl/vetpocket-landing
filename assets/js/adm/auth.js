/**
 * VetHome - Autenticação e Gestão ADM (Versão Definitiva)
 */

// 1. FUNÇÃO DE LOGOUT (Agora Global)
window.logout = async function () {
  console.log("Iniciando processo de logout...");
  try {
    const url = `${API_CONFIG.BASE_URL}logout.php`.replace(
      /([^:]\/)\/+/g,
      "$1",
    );

    await fetch(url, {
      ...API_CONFIG.FETCH_OPTIONS,
      method: "POST",
    });
  } catch (error) {
    console.error("Erro na comunicação com o servidor durante logout:", error);
  } finally {
    // Limpa as permissões locais
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("vet_token");

    console.log("Sessão encerrada. Redirecionando para o login...");

    // Redireciona para o login
    window.location.replace("login.html");
  }
};
// 2. ESCUTA CLIQUES NO DOCUMENTO (Delegação de Evento)
// Resolve o problema de botões injetados dinamicamente via header.html
document.addEventListener("click", function (e) {
  // Verifica se o clique foi no botão Sair ou em qualquer ícone dentro dele
  const btnLogout = e.target.closest("#btnLogout");

  if (btnLogout) {
    console.log("Botão Sair clicado!");
    e.preventDefault();
    e.stopPropagation();
    logout();
  }
});

// 3. LÓGICA DE LOGIN E INTERFACE (Apenas quando o DOM carregar)
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Sistema ADM Pronto.");

  // Inicializa ícones Lucide (se existirem)
  if (typeof lucide !== "undefined") lucide.createIcons();

  // Lógica do Olhinho (Senha)
  const wrapper = document.querySelector("#wrapperSenha");
  const passwordInput = document.querySelector("#password");
  if (wrapper && passwordInput) {
    wrapper.addEventListener("click", (e) => {
      if (e.target.closest(".toggle-icon")) {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        const icon = e.target.closest(".toggle-icon");
        icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
        lucide.createIcons();
      }
    });
  }

  // Formulário de Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = async function (e) {
      e.preventDefault();
      const usuario = document.getElementById("user").value;
      const senha = document.getElementById("password").value;

      try {
        const url = `${API_CONFIG.BASE_URL}login.php`.replace(
          /([^:]\/)\/+/g,
          "$1",
        );
        const response = await fetch(url, {
          method: "POST",
          ...API_CONFIG.FETCH_OPTIONS, // Isso traz o Content-Type e o credentials
          body: JSON.stringify({ usuario, senha }),
        });

        const result = await response.json();

        if (result.status === "success") {
          showToast("Acesso autorizado! 🐾", "success");
          localStorage.setItem("isLoggedIn", "true");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          showToast(result.message || "Credenciais inválidas.", "error");
        }
      } catch (error) {
        showToast("Erro ao conectar ao servidor.", "error");
      }
    };
  }
});
