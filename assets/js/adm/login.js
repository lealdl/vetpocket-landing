document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const email = document.getElementById("usuario").value; // Mudei para email conforme seu backend
      const password = document.getElementById("senha").value;
      const btnTexto = document.getElementById("btn-texto");
      const loader = document.getElementById("loader");

      btnTexto.style.display = "none";
      loader.style.display = "block";

      try {
        // Ajustado para bater com sua rota Express (porta 3001)
        const response = await fetch("https://llrh.com.br/api/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }), // Backend espera 'email' e 'password'
        });

        const result = await response.json();

        if (result.auth === true) {
          // 🛡️ A PARTE QUE FALTAVA: Salvar o token e dados do usuário
          localStorage.setItem("@VetHome:token", result.token);
          localStorage.setItem(
            "@VetHome:user",
            JSON.stringify({
              name: result.name,
              nivel: result.nivel,
              foto: result.foto,
            }),
          );

          // Redireciona
          window.location.href = "dashboard.html";
        } else {
          alert(result.message || "Credenciais inválidas.");
          loader.style.display = "none";
          btnTexto.style.display = "block";
        }
      } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao conectar com o servidor Node.js.");
        loader.style.display = "none";
        btnTexto.style.display = "block";
      }
    };
  }
});
