/**
 * LÓGICA DO ACORDEON (FAQ) - VETPOCKET
 */
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Fecha todos os outros itens (opcional, para efeito sanfona)
      faqItems.forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".icon").innerText = "+";
      });

      // Se o item clicado não estava aberto, abre ele
      if (!isOpen) {
        item.classList.add("active");
        question.querySelector(".icon").innerText = "-";
      }
    });
  });
});
