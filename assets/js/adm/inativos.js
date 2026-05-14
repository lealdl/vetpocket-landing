const state = {
  leads: [],
  selectedIds: [],
};

document.addEventListener("DOMContentLoaded", async () => {
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

    if (response.status === 401) return executarLogout();
    if (!response.ok) throw new Error("Falha na comunicação com o servidor.");

    state.leads = await response.json();

    atualizarCardsInativos(state.leads);
    renderizarTabela(state.leads);
  } catch (error) {
    console.error("❌ Erro:", error);
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

  // Performance: Usando DocumentFragment para evitar múltiplos repaints
  const fragment = document.createDocumentFragment();

  leads.forEach((lead) => {
    const dataBr = lead.data_cadastro
      ? new Date(lead.data_cadastro).toLocaleDateString("pt-BR")
      : "---";

    const row = document.createElement("tr");
    row.className = lead.status_especial === "Usuário Beta" ? "row-beta" : "";

    row.innerHTML = `
            <td data-label="Selecionar">
                <input type="checkbox" class="lead-checkbox" value="${lead.id}" onclick="event.stopPropagation()">
            </td>
            <td data-label="Nome"><strong>${lead.nome}</strong></td>
            <td data-label="E-mail">${lead.email}</td>
            <td data-label="Telefone">${lead.telefone || "---"}</td>
            <td class="desktop-only">${lead.perfil || "---"}</td>
            <td class="desktop-only">${dataBr}</td>
        `;

    row.onclick = () => abrirModalInativo(lead, dataBr);
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
    const checked = document.querySelectorAll(".lead-checkbox:checked");
    const anyChecked = checked.length > 0;

    if (btnRestaurar) btnRestaurar.style.display = anyChecked ? "flex" : "none";
    if (btnExcluir) btnExcluir.style.display = anyChecked ? "flex" : "none";
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
  // Evento Restaurar
  document
    .getElementById("btnRestaurar")
    ?.addEventListener("click", async () => {
      await processarAcaoLeads(
        "restaurar-leads.php",
        "Restaurar selecionados para lista ativa?",
      );
    });

  // Evento Excluir Definitivo (Sua nova Lixeira)
  document
    .getElementById("btnExcluirDefinitivo")
    ?.addEventListener("click", async () => {
      await processarAcaoLeads(
        "excluir-leads.php",
        "⚠️ CUIDADO: Excluir permanentemente do banco de dados?",
      );
    });
}

async function processarAcaoLeads(endpoint, mensagem) {
  const ids = Array.from(
    document.querySelectorAll(".lead-checkbox:checked"),
  ).map((cb) => cb.value);
  if (!confirm(mensagem)) return;

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "POST",
      ...API_CONFIG.FETCH_OPTIONS,
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();
    if (result.status === "success") {
      showToast(result.message, "success");
      setTimeout(() => location.reload(), 1000);
    }
  } catch (e) {
    showToast("Erro ao processar solicitação", "error");
  }
}
