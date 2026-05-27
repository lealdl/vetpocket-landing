/**
 * VetHome - Script Unificado (Demo + Modais + FAQ)
 */
let currentSlide = 0;

// Função global de troca de slides
window.changeSlide = function (direction) {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
};

document.addEventListener("click", (e) => {
  const modalDemo = document.getElementById("modal-demo");
  const modalInteresse = document.getElementById("waitlistModal");

  // --- AÇÕES DE ABRIR ---
  if (e.target.closest(".abrir-demo")) {
    e.preventDefault();
    if (modalDemo) {
      modalDemo.style.display = "block";
      document.body.style.overflow = "hidden";
      // Reinicia carrossel
      const slides = document.querySelectorAll(".slide");
      if (slides.length > 0) {
        slides.forEach((s) => s.classList.remove("active"));
        currentSlide = 0;
        slides[0].classList.add("active");
      }
    }
  }

  if (e.target.closest(".abrir-modal")) {
    e.preventDefault();
    if (modalInteresse) modalInteresse.style.display = "block";
  }

  // --- AÇÕES DE FECHAR (O PONTO CRÍTICO) ---

  // Para o Modal de Demo: Fecha se clicar no X OU se o alvo exato for o modal (fundo)
  if (modalDemo && modalDemo.style.display === "block") {
    if (e.target.classList.contains("close-demo") || e.target === modalDemo) {
      modalDemo.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  // Para o Modal de Interesse
  if (modalInteresse && modalInteresse.style.display === "block") {
    if (
      e.target.classList.contains("close-modal") ||
      e.target === modalInteresse
    ) {
      modalInteresse.style.display = "none";
    }
  }
});
