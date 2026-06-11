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
/**
 * Gerencia Cliques no Header de forma centralizada
 */
function setupHeaderInteractions() {
  if (window.headerEventsBound) return;
  window.headerEventsBound = true;

  // Menu mobile - versão simplificada
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const menuOverlay = document.getElementById('menuOverlay');

  if (mobileBtn && navLinks && menuOverlay) {
    // Abrir/fechar menu
    mobileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navLinks.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Fechar ao clicar no overlay
    menuOverlay.addEventListener('click', function() {
      navLinks.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    // IMPORTANTE: Permitir que os links funcionem
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Se for link interno (âncora), deixa o comportamento padrão
        if (href && href.startsWith('#')) {
          // Fecha o menu
          navLinks.classList.remove('active');
          menuOverlay.classList.remove('active');
          document.body.style.overflow = '';
          // Deixa o navegador fazer a rolagem (já tem smooth scroll no CSS)
          return;
        }
        
        // Se for link externo, também fecha o menu
        navLinks.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  console.log("✅ Interações do Header configuradas.");
}

async function executarLogout() {
  localStorage.removeItem("isLoggedIn");
  window.location.replace("login.html");
}

document.addEventListener("DOMContentLoaded", () => {
  const isAdm = window.location.pathname.includes("/adm/");
  const prefix = isAdm ? "../../" : "";

  loadComponent(
    "header-placeholder",
    `${prefix}assets/components/${isAdm ? "header-adm.html" : "header.html"}`,
  );

  loadComponent("footer-placeholder", `${prefix}assets/components/footer.html`);
});
