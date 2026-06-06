/**
 * assets/js/adm/leads.js
 * Gerenciamento de Leads com Arquivamento - VetPocket ADM
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 🔥 CORRIGIDO: Verificação completa e caminho absoluto
  if (!localStorage.getItem("isLoggedIn") || localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "/login.html";
    return;
  }

  console.log("📊 Iniciando busca de leads...");
  await carregarLeads();
  setupGlobalEvents();
});

async function carregarLeads() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}ver-leads.php`, {
      method: "GET",
      ...API_CONFIG.FETCH_OPTIONS,
    });

    if (!response.ok) {
      if (response.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        setTimeout(() => window.location.href = "/login.html", 2000);
        return;
      }
      throw new Error("Erro na requisição ao servidor");
    }

    const leads = await response.json();
    atualizarStats(leads);
    renderizarTabela(leads);
  } catch (error) {
    console.error("❌ Erro ao carregar leads:", error);
    showToast("Erro ao carregar leads", "error");
  }
}

function atualizarStats(leads) {
  if (!leads || !Array.isArray(leads)) return;

  const stats = {
    total: leads.length,
    homecare: leads.filter((l) => l.perfil?.trim().toLowerCase() === "homecare")
      .length,
    clinica: leads.filter((l) => l.perfil?.trim().toLowerCase() === "fixa")
      .length,
    misto: leads.filter((l) => l.perfil?.trim().toLowerCase() === "misto")
      .length,
  };

  animarNumero("stat-total", stats.total);
  animarNumero("stat-homecare", stats.homecare);
  animarNumero("stat-clinica", stats.clinica);
  animarNumero("stat-misto", stats.misto);
}

function animarNumero(id, valorFinal) {
  const elemento = document.getElementById(id);
  if (!elemento) return;
  let valorAtual = 0;
  const incremento = valorFinal / 30;
  const contagem = setInterval(() => {
    valorAtual += incremento;
    if (valorAtual >= valorFinal) {
      elemento.innerText = valorFinal;
      clearInterval(contagem);
    } else {
      elemento.innerText = Math.floor(valorAtual);
    }
  }, 30);
}

function renderizarTabela(leads) {
  const tableBody = document.getElementById("leads-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (!leads || leads.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#64748b;">
      <i class="fas fa-inbox"></i> Nenhum lead encontrado.
    </td></tr>`;
    return;
  }

  leads.forEach((lead) => {
    const dataBr = lead.data_cadastro
      ? new Date(lead.data_cadastro).toLocaleDateString("pt-BR")
      : "---";
    const isBeta = lead.status_especial === "Usuário Beta";

    const row = document.createElement("tr");
    if (isBeta) row.style.backgroundColor = "#f0fdf4";

    row.innerHTML = `
      <td style="width: 40px; text-align: center;">
        <input type="checkbox" class="lead-checkbox" value="${escapeHtml(lead.id)}" onclick="event.stopPropagation()">
      </td>
      <td>
        <strong>${escapeHtml(lead.nome)}</strong>
      </td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.telefone || "---")}</td>
      <td class="desktop-only">${escapeHtml(lead.perfil || "---")}</td>
      <td class="desktop-only">${dataBr}</td>
    `;

    row.style.cursor = "pointer";
    row.onclick = () => abrirModal(lead, dataBr);
    tableBody.appendChild(row);
  });

  setupCheckboxLogic();
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupCheckboxLogic() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".lead-checkbox");
  const btnArquivar = document.getElementById("btnArquivar");

  if (selectAll) {
    selectAll.checked = false;
    selectAll.onclick = () => {
      checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
      toggleArchiveBtn();
    };
  }

  checkboxes.forEach((cb) => (cb.onchange = toggleArchiveBtn));

  function toggleArchiveBtn() {
    const anyChecked = Array.from(checkboxes).some((c) => c.checked);
    if (btnArquivar) btnArquivar.style.display = anyChecked ? "flex" : "none";
  }
}

function setupGlobalEvents() {
  const btnArquivar = document.getElementById("btnArquivar");
  if (btnArquivar) {
    btnArquivar.onclick = async () => {
      const ids = Array.from(
        document.querySelectorAll(".lead-checkbox:checked"),
      ).map((cb) => cb.value);
      
      if (ids.length === 0) {
        showToast("Nenhum lead selecionado", "warning");
        return;
      }
      
      if (!confirm(`Arquivar ${ids.length} leads selecionados? Eles sairão do contador de vagas.`)) return;

      const originalText = btnArquivar.innerHTML;
      btnArquivar.disabled = true;
      btnArquivar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Arquivando...';

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}arquivar-leads.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          credentials: "include",
        });

        if (res.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          setTimeout(() => window.location.href = "/login.html", 2000);
          return;
        }

        const result = await res.json();
        if (result.status === "success") {
          showToast(result.message, "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          showToast(result.message || "Erro ao arquivar", "error");
          btnArquivar.disabled = false;
          btnArquivar.innerHTML = originalText;
        }
      } catch (e) {
        console.error("Erro ao arquivar:", e);
        showToast("Erro ao arquivar leads", "error");
        btnArquivar.disabled = false;
        btnArquivar.innerHTML = originalText;
      }
    };
  }

  document
    .getElementById("formEdicaoLead")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dados = {
        id: document.getElementById("modalId").value,
        nome: document.getElementById("inputNome").value,
        email: document.getElementById("inputEmail").value,
        telefone: document.getElementById("inputTelefone").value,
        status_especial: document.getElementById("inputStatusEspecial").value,
        notas_internas: document.getElementById("inputNotas").value,
      };

      try {
        const resp = await fetch(`${API_CONFIG.BASE_URL}atualizar-lead.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
          credentials: "include",
        });

        const result = await resp.json();
        if (result.success || result.status === "success") {
          showToast("Lead atualizado!", "success");
          fecharModal();
          setTimeout(() => location.reload(), 1500);
        }
      } catch (error) {
        console.error(error);
        showToast("Erro ao atualizar lead", "error");
      }
    });
}

function abrirModal(lead, dataFormatada) {
  document.getElementById("modalId").value = lead.id;
  document.getElementById("inputNome").value = lead.nome;
  document.getElementById("inputEmail").value = lead.email;
  document.getElementById("inputTelefone").value = lead.telefone || "";
  document.getElementById("inputStatusEspecial").value =
    lead.status_especial || "Nenhum";
  document.getElementById("inputNotas").value = lead.notas_internas || "";
  document.getElementById("modalData").innerText = dataFormatada;

  const btnWhats = document.getElementById("btnWhatsapp");
  const num = String(lead.telefone || "").replace(/\D/g, "");
  if (num.length >= 10) {
    btnWhats.href = `https://wa.me/${num.startsWith("55") ? "" : "55"}${num}`;
    btnWhats.style.display = "flex";
  } else {
    btnWhats.style.display = "none";
  }

  document.getElementById("modalEdicao").style.display = "flex";
}

window.fecharModal = () =>
  (document.getElementById("modalEdicao").style.display = "none");

window.copiarTexto = (texto) => {
  navigator.clipboard
    .writeText(texto)
    .then(() => showToast("Copiado! 📋", "success"));
};