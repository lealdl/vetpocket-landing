/**
 * New-VetPocket - Gerenciamento de Leads Arquivados/Inativos
 * Local: assets/js/adm/inativos.js
 */

// --- 1. FUNÇÕES DE UTILIDADE (Escopo Global) ---

/**
 * Calcula e exibe as estatísticas nos cards superiores
 */
function atualizarCardsInativos(leads) {
  console.log("📊 New-VetPocket: Atualizando cards estatísticos...");
  const total = leads.length;

  // Filtros baseados no perfil (Case-insensitive)
  const homecare = leads.filter((l) =>
    l.perfil?.toLowerCase().includes("home"),
  ).length;
  const clinica = leads.filter(
    (l) =>
      l.perfil?.toLowerCase().includes("clinica") ||
      l.perfil?.toLowerCase().includes("fixa"),
  ).length;
  const misto = leads.filter((l) =>
    l.perfil?.toLowerCase().includes("misto"),
  ).length;

  // Atualização do DOM
  const elementos = {
    "stat-total": total,
    "stat-homecare": homecare,
    "stat-clinica": clinica,
    "stat-misto": misto,
  };

  Object.entries(elementos).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  });
}

/**
 * Processa ações em massa (Restaurar ou Excluir)
 */
async function processarAcaoLeads(endpoint, mensagem) {
  const checkboxes = document.querySelectorAll(".lead-checkbox:checked");
  const ids = Array.from(checkboxes).map((cb) => cb.value);

  if (ids.length === 0) {
    showToast("Selecione ao menos um lead", "error");
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...API_CONFIG.FETCH_OPTIONS,
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();

    if (result.status === "success") {
      // O Toast decente que configuramos assume o papel de dar o feedback
      showToast(result.message, "success");
      setTimeout(() => location.reload(), 1000);
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    showToast("Erro na comunicação com o servidor", "error");
  }
}
// --- 2. FLUXO PRINCIPAL ---

document.addEventListener("DOMContentLoaded", async () => {
  // Verificação de autenticação
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("login.html");
    return;
  }

  console.log("📂 New-VetPocket: Gerenciando Inativos...");
  await carregarInativos();
  setupEventListeners();
});

async function carregarInativos() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}ver-inativos.php`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    });

    if (response.status === 401) {
      localStorage.removeItem("isLoggedIn");
      window.location.replace("login.html");
      return;
    }

    if (!response.ok) throw new Error("Erro ao buscar inativos");

    const leads = await response.json();

    atualizarCardsInativos(leads);
    renderizarTabela(leads);
  } catch (error) {
    console.error("❌ Erro no carregamento:", error);
    showToast("Erro ao carregar lista de inativos", "error");
  }
}

function renderizarTabela(leads) {
  const tableBody = document.getElementById("leads-table-body");
  if (!tableBody) return;

  if (leads.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum lead arquivado encontrado.</td></tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  leads.forEach((lead) => {
    const dataBr = lead.data_cadastro
      ? new Date(lead.data_cadastro).toLocaleDateString("pt-BR")
      : "---";

    const row = document.createElement("tr");
    row.style.cursor = "pointer";

    // Destaque para usuários Beta
    if (lead.status_especial === "Usuário Beta") {
      row.classList.add("row-beta");
    }

    row.innerHTML = `
            <td data-label="Selecionar">
                <input type="checkbox" class="lead-checkbox" value="${lead.id}" onclick="event.stopPropagation()">
            </td>
            <td data-label="Nome"><strong>${lead.nome}</strong></td>
            <td data-label="E-mail">${lead.email}</td>
            <td data-label="WhatsApp">${lead.telefone || "---"}</td>
            <td class="desktop-only">${lead.perfil || "---"}</td>
            <td class="desktop-only">${dataBr}</td>
        `;

    row.onclick = () => console.log("Visualizando lead:", lead.id);
    fragment.appendChild(row);
  });

  tableBody.innerHTML = "";
  tableBody.appendChild(fragment);
  setupCheckboxLogic();
}

function setupCheckboxLogic() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".lead-checkbox");
  const btnRestaurar = document.getElementById("btnRestaurar");
  const btnExcluir = document.getElementById("btnExcluirDefinitivo");

  const toggleActions = () => {
    const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
    const display = anyChecked ? "flex" : "none";

    if (btnRestaurar) btnRestaurar.style.display = display;
    if (btnExcluir) btnExcluir.style.display = display;
  };

  if (selectAll) {
    selectAll.checked = false;
    selectAll.onclick = () => {
      checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
      toggleActions();
    };
  }

  checkboxes.forEach((cb) => (cb.onchange = toggleActions));
}

function setupEventListeners() {
  const btnRestaurar = document.getElementById("btnRestaurar");
  const btnExcluir = document.getElementById("btnExcluirDefinitivo");

  btnRestaurar?.addEventListener("click", () => {
    processarAcaoLeads(
      "restaurar-leads.php",
      "Deseja restaurar {n} leads para a lista ativa?",
    );
  });

  btnExcluir?.addEventListener("click", () => {
    processarAcaoLeads(
      "excluir-leads.php",
      "⚠️ AVISO CRÍTICO: Deseja excluir permanentemente {n} leads do banco de dados? Esta ação não pode ser desfeita.",
    );
  });
}
