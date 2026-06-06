document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const email = document.getElementById("usuario").value;
      const password = document.getElementById("senha").value;
      const btnTexto = document.getElementById("btn-texto");
      const loader = document.getElementById("loader");

      btnTexto.style.display = "none";
      loader.style.display = "block";

      try {
        // 🔥 CORRIGIDO: apontando para o PHP
        const response = await fetch("https://llrh.com.br/backend-landing/login.php", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (result.auth === true) {
          localStorage.setItem("@VetHome:token", result.token);
          localStorage.setItem(
            "@VetHome:user",
            JSON.stringify({
              id: result.user?.id,
              name: result.user?.nome || result.user?.name,
              email: result.user?.email,
              nivel_acesso: result.user?.nivel_acesso,
              cargo: result.user?.cargo,
              sexo: result.user?.sexo,
              foto: result.user?.foto,
            }),
          );

          window.location.href = "dashboard.html";
        } else {
          alert(result.message || "Credenciais inválidas.");
          loader.style.display = "none";
          btnTexto.style.display = "block";
        }
      } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao conectar com o servidor.");
        loader.style.display = "none";
        btnTexto.style.display = "block";
      }
    };
  }
});