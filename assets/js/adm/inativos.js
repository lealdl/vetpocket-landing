/**
 * assets/js/adm/inativos.js
 * Gerenciamento de Leads Arquivados - VetPocket ADM
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html";
    return;
  }

  console.log("📂 Carregando arquivo de inativos...");
  await carregarInativos();
  setupGlobalEvents();
});

async function carregarInativos() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}ver-inativos.php`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS, // Inclui credentials: 'include'
    });

    if (!response.ok) throw new Error("Erro ao buscar inativos");

    const leads = await response.json();
    renderizarTabela(leads);
  } catch (error) {
    console.error("❌ Erro:", error);
    showToast("Erro ao carregar inativos", "error");
  }
}

function renderizarTabela(leads) {
  const tableBody = document.getElementById("leads-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (leads.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#64748b;">Nenhum lead arquivado.</td></tr>`;
    return;
  }

  leads.forEach((lead) => {
    const dataBr = lead.data_cadastro
      ? new Date(lead.data_cadastro).toLocaleDateString("pt-BR")
      : "---";
    const row = document.createElement("tr");

    // Adicionamos data-label para manter a responsividade que criamos
    row.innerHTML = `
          <td data-label="Selecionar">
            <input type="checkbox" class="lead-checkbox" value="${lead.id}" onclick="event.stopPropagation()">
          </td>
          <td data-label="Nome">
            <strong>${lead.nome}</strong>
          </td>
          <td data-label="E-mail">${lead.email}</td>
          <td data-label="Telefone">${lead.telefone || "---"}</td>
          <td class="desktop-only" data-label="Perfil">${lead.perfil || "---"}</td>
          <td class="desktop-only" data-label="Arquivado em">${dataBr}</td>`;

    row.style.cursor = "pointer";
    row.onclick = () => abrirModalInativo(lead, dataBr);
    tableBody.appendChild(row);
  });

  setupCheckboxLogic();
}

function setupCheckboxLogic() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".lead-checkbox");
  const btnRestaurar = document.getElementById("btnRestaurar"); // Botão novo no HTML

  if (selectAll) {
    selectAll.checked = false;
    selectAll.onclick = () => {
      checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
      toggleActionsBtn();
    };
  }

  checkboxes.forEach((cb) => (cb.onchange = toggleActionsBtn));

  function toggleActionsBtn() {
    const anyChecked = Array.from(checkboxes).some((c) => c.checked);
    if (btnRestaurar) btnRestaurar.style.display = anyChecked ? "flex" : "none";
  }
}

function setupGlobalEvents() {
  const btnRestaurar = document.getElementById("btnRestaurar");

  if (btnRestaurar) {
    btnRestaurar.onclick = async () => {
      const ids = Array.from(
        document.querySelectorAll(".lead-checkbox:checked"),
      ).map((cb) => cb.value);

      if (!confirm(`Restaurar ${ids.length} leads para a lista ativa?`)) return;

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}restaurar-leads.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          credentials: "include", // Essencial para o seu setup Fedora/Vercel
        });

        const result = await res.json();
        if (result.status === "success") {
          showToast(result.message, "success");
          location.reload();
        }
      } catch (e) {
        showToast("Erro ao restaurar", "error");
      }
    };
  }
}

// Modal simplificado apenas para visualização de notas de inativos
function abrirModalInativo(lead, dataBr) {
  // Você pode usar o mesmo modal de edição, mas desativar os campos (readonly)
  // ou apenas mostrar as informações e notas internas.
  console.log("Visualizando inativo:", lead);
  // Lógica de abertura de modal aqui...
}
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
// Função para calcular e exibir os números nos cards
function atualizarCardsInativos(leads) {
  const total = leads.length;

  // Usamos .toLowerCase() e .includes() para evitar erros de digitação ou acentuação
  const homecare = leads.filter(
    (l) => l.perfil && l.perfil.toLowerCase().includes("home"),
  ).length;

  const clinica = leads.filter(
    (l) =>
      l.perfil &&
      (l.perfil.toLowerCase().includes("clinica") ||
        l.perfil.toLowerCase().includes("fixa")),
  ).length;

  const misto = leads.filter(
    (l) => l.perfil && l.perfil.toLowerCase().includes("misto"),
  ).length;

  // Atualiza os cards no HTML
  if (document.getElementById("stat-total"))
    document.getElementById("stat-total").textContent = total;
  if (document.getElementById("stat-homecare"))
    document.getElementById("stat-homecare").textContent = homecare;
  if (document.getElementById("stat-clinica"))
    document.getElementById("stat-clinica").textContent = clinica;
  if (document.getElementById("stat-misto"))
    document.getElementById("stat-misto").textContent = misto;
}
// Onde inserir no seu fetch:
async function carregarInativos() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}ver-inativos.php`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    });

    const leads = await response.json();

    // ATUALIZA OS CARDS ANTES DE RENDERIZAR A TABELA
    atualizarCardsInativos(leads);
    renderizarTabela(leads);
  } catch (error) {
    showToast("Erro ao carregar inativos:", error);
  }
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
