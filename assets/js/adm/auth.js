// assets/js/adm/auth.js

document.addEventListener("DOMContentLoaded", () => {
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
          localStorage.setItem("isLoggedIn", "true");
          
          if (result.token) localStorage.setItem("auth_token", result.token);
          if (result.user_id) localStorage.setItem("user_id", result.user_id);
          if (result.user_name) localStorage.setItem("user_name", result.user_name);
          
          showToast("Login realizado com sucesso!", "success");
          
          // 🔥 CAMINHO ABSOLUTO - começa com /
          setTimeout(() => {
            window.location.href = "/pages/adm/index.html";
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
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
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
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }
  
  console.log("✅ Sistema ADM Pronto.");
});