/**
 * LÓGICA DO ACORDEON (FAQ) - VETPOCKET
 */
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const icon = question.querySelector(".icon");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Fecha todos os outros itens (sanfona)
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          const otherIcon = otherItem.querySelector(".icon");
          if (otherIcon) otherIcon.textContent = "+";
        }
      });

      // Alterna o item clicado
      if (isOpen) {
        item.classList.remove("active");
        if (icon) icon.textContent = "+";
      } else {
        item.classList.add("active");
        if (icon) icon.textContent = "-";
      }
    });
  });
});