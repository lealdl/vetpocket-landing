/**
 * VetPocket - Carregador de Componentes (ADM & Landing)
 */
async function loadComponent(id, path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Erro: ${path}`);
    const html = await response.text();
    const element = document.getElementById(id);

    if (element) {
      element.innerHTML = html;

      if (id === "header-placeholder") {
        setTimeout(() => {
          const header =
            element.querySelector(".navbar") ||
            element.querySelector(".main-header");
          if (header)
            document.body.style.paddingTop = header.offsetHeight + "px";
        }, 100);

        if (typeof lucide !== "undefined") lucide.createIcons();
        setupHeaderInteractions();
      }

      if (id === "footer-placeholder") {
        const yearSpan = document.getElementById("year");
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
      }
    }
  } catch (error) {
    console.error("Erro no Loader:", error);
  }
}

/**
 * Gerencia Cliques no Header de forma centralizada
 */
function setupHeaderInteractions() {
  // Evita duplicar eventos caso a função seja chamada mais de uma vez
  if (window.headerEventsBound) return;
  window.headerEventsBound = true;

  document.addEventListener("click", (e) => {
    // 1. Detecta o clique no botão de menu (Hambúrguer)
    const toggleBtn = e.target.closest("#mobileMenuBtn");

    if (toggleBtn) {
      // Elementos do Painel Administrativo (VetPocket)
      const sidebar = document.querySelector(".adm-sidebar");
      const admOverlay = document.querySelector(".adm-overlay");

      // Elementos da Landing Page
      const navLinks = document.querySelector(".nav-links");
      const menuOverlay = document.querySelector(".menu-overlay");

      // PRIORIDADE 1: Se estivermos no ADM, prioriza a Sidebar
      if (sidebar) {
        sidebar.classList.toggle("active");
        if (admOverlay) {
          admOverlay.classList.toggle("active");
        }
      }
      // PRIORIDADE 2: Se não houver sidebar, tenta o menu da Landing Page
      else if (navLinks) {
        navLinks.classList.toggle("active");
        if (menuOverlay) {
          menuOverlay.classList.toggle("active");
        }
      }
      return;
    }

    // 2. Fechar menu ao clicar no Overlay (fundo escuro)
    const isOverlay =
      e.target.classList.contains("adm-overlay") ||
      e.target.classList.contains("menu-overlay");
    if (isOverlay) {
      const activeSidebar = document.querySelector(".adm-sidebar.active");
      const activeNav = document.querySelector(".nav-links.active");

      if (activeSidebar) {
        activeSidebar.classList.remove("active");
        e.target.classList.remove("active");
      }
      if (activeNav) {
        activeNav.classList.remove("active");
        e.target.classList.remove("active");
      }
    }
  });

  console.log("✅ Interações do Header configuradas.");
}

async function executarLogout() {
  localStorage.removeItem("isLoggedIn");
  window.location.replace("login.html");
}

document.addEventListener("DOMContentLoaded", () => {
  // Verificamos se a página atual está dentro de /pages/adm/
  const isAdm = window.location.pathname.includes("/pages/adm/");

  // Usar caminhos absolutos (iniciando com /) evita o erro de "Base path"
  const headerPath = isAdm
    ? "/assets/components/header-adm.html"
    : "/assets/components/header.html";

  const footerPath = "/assets/components/footer.html";

  loadComponent("header-placeholder", headerPath);
  loadComponent("footer-placeholder", footerPath);
});
