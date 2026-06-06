// assets/js/adm/auth.js

document.addEventListener("DOMContentLoaded", () => {
  // Verificar se já está logado
  if (localStorage.getItem("isLoggedIn") === "true") {
    // Redirecionar para leads se já estiver logado
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "leads.html";
    }
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

        console.log("📡 Status da resposta:", response.status);
        
        const result = await response.json();
        console.log("📄 Resposta do servidor:", result);

        if (result.status === "success") {
          localStorage.setItem("isLoggedIn", "true");
          
          if (result.token) {
            localStorage.setItem("auth_token", result.token);
          }
          if (result.user_id) {
            localStorage.setItem("user_id", result.user_id);
          }
          
          showToast("Login realizado com sucesso!", "success");
          
          setTimeout(() => {
            window.location.href = "leads.html";
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
  
  console.log("✅ Sistema ADM Pronto.");
});