// assets/js/adm/auth.js

document.addEventListener("DOMContentLoaded", () => {
  // Verificar se já está logado - EVITAR LOOP INFINITO
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentPage = window.location.pathname;
  
  // Se já está logado e está na página de login, redirecionar para o admin
  if (isLoggedIn === "true" && (currentPage.includes("login.html") || currentPage.includes("login"))) {
    window.location.href = "pages/adm/index.html";
    return;
  }
  
  // Se não está logado e NÃO está na página de login, redirecionar para login
  if (isLoggedIn !== "true" && !currentPage.includes("login.html") && !currentPage.includes("login")) {
    window.location.href = "login.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const usuario = document.getElementById("user").value;
      const senha = document.getElementById("password").value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Mostrar loading
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
      submitBtn.disabled = true;

      try {
        console.log("🔍 Tentando login com usuário:", usuario);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}login.php`, {
          method: "POST",
          credentials: "include",
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ usuario, senha }),
        });

        const result = await response.json();

        if (result.status === "success") {
          // Salvar dados no localStorage
          localStorage.setItem("isLoggedIn", "true");
          
          if (result.token) {
            localStorage.setItem("auth_token", result.token);
          }
          if (result.user_id) {
            localStorage.setItem("user_id", result.user_id);
          }
          if (result.user_name) {
            localStorage.setItem("user_name", result.user_name);
          }
          
          showToast("Login realizado com sucesso!", "success");
          
          // Redirecionar para o dashboard/admin
          setTimeout(() => {
            window.location.href = "pages/adm/index.html";
          }, 1000);
        } else {
          showToast(result.message || "Credenciais inválidas.", "error");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error("❌ Erro no login:", error);
        showToast("Erro ao conectar com o servidor.", "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    };
  }
  
  // Inicializar ícones do Lucide se disponível
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Alternar visibilidade da senha
  const toggleIcon = document.querySelector('.toggle-icon');
  if (toggleIcon) {
    toggleIcon.addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.setAttribute('data-lucide', 'eye-off');
      } else {
        passwordInput.type = 'password';
        this.setAttribute('data-lucide', 'eye');
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }
  
  console.log("✅ Sistema ADM Pronto.");
});