async function loadFooter() {
  const placeholder = document.getElementById("footer-placeholder");

  try {
    // Busca o arquivo footer.html na raiz do projeto
    const response = await fetch("footer.html");

    if (!response.ok) throw new Error("Erro ao carregar arquivo do footer");

    const html = await response.text();

    // Injeta o HTML dentro da div placeholder
    placeholder.innerHTML = html;

    // Após injetar, atualiza o ano automaticamente
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  } catch (error) {
    console.error("Erro:", error);
    // Fallback caso o arquivo suma:
    placeholder.innerHTML = `<footer style="text-align:center; padding:20px;">&copy; ${new Date().getFullYear()} VetPocket</footer>`;
  }
}

// Inicializa a carga do footer
document.addEventListener("DOMContentLoaded", loadFooter);
