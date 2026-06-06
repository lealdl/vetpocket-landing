/**
 * assets/js/adm/inativos.js
 * Gerenciamento de Leads Arquivados - VetPocket ADM
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 🔥 CORRIGIDO: Caminho absoluto para login
  if (!localStorage.getItem("isLoggedIn") || localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "/login.html";
    return;
  }

  console.log("📂 Carregando leads arquivados...");
  await carregarInativos();
  setupGlobalEvents();
});

async function carregarInativos() {
  try {
    console.log("🔍 Buscando leads inativos em:", `${API_CONFIG.BASE_URL}ver-inativos.php`);
    
    // 🔥 PEGAR O TOKEN DO LOCALSTORAGE
    const token = localStorage.getItem("auth_token");
    
    // 🔥 CONFIGURAR HEADERS COM TOKEN
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("🔑 Token enviado:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ Nenhum token encontrado no localStorage");
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}ver-inativos.php`, {
      method: "GET",
      credentials: "include",
      headers: headers
    });

    console.log("📡 Status da resposta:", response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        // Limpar dados antigos
        localStorage.removeItem("auth_token");
        localStorage.removeItem("isLoggedIn");
        // Redirecionar para login
        setTimeout(() => window.location.href = "/login.html", 2000);
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Verificar se a resposta tem conteúdo
    const textResponse = await response.text();
    console.log("📄 Resposta bruta:", textResponse.substring(0, 200));
    
    if (!textResponse || textResponse.trim() === "") {
      throw new Error("Resposta vazia do servidor");
    }
    
    let leads;
    try {
      leads = JSON.parse(textResponse);
    } catch (e) {
      console.error("❌ Erro ao fazer parse do JSON:", e);
      throw new Error("Resposta inválida do servidor");
    }
    
    if (!Array.isArray(leads)) {
      console.error("Resposta não é um array:", leads);
      if (leads && leads.error) {
        throw new Error(leads.error);
      }
      throw new Error("Formato de resposta inválido");
    }
    
    console.log(`✅ ${leads.length} leads inativos carregados`);
    atualizarCardsInativos(leads);
    renderizarTabela(leads);
    
  } catch (error) {
    console.error("❌ Erro ao carregar inativos:", error);
    showToast("Erro ao carregar leads arquivados: " + error.message, "error");
    
    const tableBody = document.getElementById("leads-table-body");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#dc2626;">
        <i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados.<br>
        <small>${error.message}</small><br>
        <button onclick="location.reload()" style="margin-top:10px; padding:8px 16px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer;">
          Tentar novamente
        </button>
      </td><tr>`;
    }
  }
}

function atualizarCardsInativos(leads) {
  if (!leads || !Array.isArray(leads)) return;

  const total = leads.length;
  const homecare = leads.filter(l => l.perfil?.toLowerCase().includes("home")).length;
  const clinica = leads.filter(l => l.perfil?.toLowerCase().includes("clinica") || l.perfil?.toLowerCase().includes("fixa")).length;
  const misto = leads.filter(l => l.perfil?.toLowerCase().includes("misto")).length;

  animarNumero("stat-total", total);
  animarNumero("stat-homecare", homecare);
  animarNumero("stat-clinica", clinica);
  animarNumero("stat-misto", misto);
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
      <i class="fas fa-inbox"></i> Nenhum lead arquivado encontrado.
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
    row.onclick = () => abrirModalInativo(lead, dataBr);
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
  const btnRestaurar = document.getElementById("btnRestaurar");

  if (selectAll) {
    selectAll.checked = false;
    selectAll.onclick = () => {
      checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
      toggleRestoreBtn();
    };
  }

  checkboxes.forEach((cb) => (cb.onchange = toggleRestoreBtn));

  function toggleRestoreBtn() {
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
      
      if (ids.length === 0) {
        showToast("Nenhum lead selecionado", "warning");
        return;
      }
      
      if (!confirm(`Restaurar ${ids.length} lead(s) selecionado(s)? Eles voltarão para a lista ativa.`)) return;

      const originalText = btnRestaurar.innerHTML;
      btnRestaurar.disabled = true;
      btnRestaurar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restaurando...';

      try {
        // 🔥 PEGAR O TOKEN
        const token = localStorage.getItem("auth_token");
        
        // 🔥 CONFIGURAR HEADERS
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_CONFIG.BASE_URL}restaurar-leads.php`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ ids }),
          credentials: "include",
        });

        if (res.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("isLoggedIn");
          setTimeout(() => window.location.href = "/login.html", 2000);
          return;
        }

        const result = await res.json();
        if (result.status === "success") {
          showToast(result.message, "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          showToast(result.message || "Erro ao restaurar", "error");
          btnRestaurar.disabled = false;
          btnRestaurar.innerHTML = originalText;
        }
      } catch (e) {
        console.error("Erro na restauração:", e);
        showToast("Erro ao restaurar leads", "error");
        btnRestaurar.disabled = false;
        btnRestaurar.innerHTML = originalText;
      }
    };
  }
}

function abrirModalInativo(lead, dataFormatada) {
  document.getElementById("modalId").value = lead.id;
  document.getElementById("inputNome").value = lead.nome;
  document.getElementById("inputEmail").value = lead.email;
  document.getElementById("inputTelefone").value = lead.telefone || "";
  document.getElementById("inputPerfil").value = lead.perfil || "---";
  document.getElementById("inputStatusEspecial").value = lead.status_especial || "Nenhum";
  document.getElementById("inputNotas").value = lead.notas_internas || "";
  document.getElementById("modalData").innerText = dataFormatada;

  // Configurar WhatsApp
  const btnWhats = document.getElementById("btnWhatsapp");
  const num = String(lead.telefone || "").replace(/\D/g, "");
  if (num.length >= 10) {
    btnWhats.href = `https://wa.me/${num.startsWith("55") ? "" : "55"}${num}`;
    btnWhats.style.display = "flex";
  } else {
    btnWhats.style.display = "none";
  }

  // Para leads inativos, desabilitar edição (apenas visualização)
  document.getElementById("inputNome").readOnly = true;
  document.getElementById("inputEmail").readOnly = true;
  document.getElementById("inputTelefone").readOnly = true;
  document.getElementById("inputPerfil").readOnly = true;
  document.getElementById("inputNotas").readOnly = true;
  document.getElementById("inputStatusEspecial").disabled = true;
  
  // Esconder botão de salvar
  const saveBtn = document.querySelector("#formEdicaoLead button[type='submit']");
  if (saveBtn) saveBtn.style.display = "none";
  
  // Adicionar botão de restaurar no modal se não existir
  let restaurarBtn = document.getElementById("btnRestaurarModal");
  const actionsDiv = document.querySelector("#formEdicaoLead .actions");
  
  if (!restaurarBtn && actionsDiv) {
    restaurarBtn = document.createElement("button");
    restaurarBtn.id = "btnRestaurarModal";
    restaurarBtn.type = "button";
    restaurarBtn.className = "btn-save";
    restaurarBtn.style.backgroundColor = "#10b981";
    restaurarBtn.innerHTML = '<i class="fas fa-undo"></i> Restaurar Lead';
    restaurarBtn.onclick = async () => {
      if (confirm(`Restaurar "${lead.nome}" para a lista ativa?`)) {
        restaurarBtn.disabled = true;
        restaurarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restaurando...';
        
        try {
          const res = await fetch(`${API_CONFIG.BASE_URL}restaurar-leads.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [lead.id] }),
            credentials: "include",
          });
          
          const result = await res.json();
          if (result.status === "success") {
            showToast(result.message, "success");
            fecharModal();
            setTimeout(() => location.reload(), 1500);
          } else {
            showToast(result.message || "Erro ao restaurar", "error");
            restaurarBtn.disabled = false;
            restaurarBtn.innerHTML = '<i class="fas fa-undo"></i> Restaurar Lead';
          }
        } catch (e) {
          console.error("Erro na restauração:", e);
          showToast("Erro ao restaurar lead", "error");
          restaurarBtn.disabled = false;
          restaurarBtn.innerHTML = '<i class="fas fa-undo"></i> Restaurar Lead';
        }
      }
    };
    actionsDiv.appendChild(restaurarBtn);
  }

  document.getElementById("modalEdicao").style.display = "flex";
}

window.fecharModal = () => {
  // Restaurar campos
  document.getElementById("inputNome").readOnly = false;
  document.getElementById("inputEmail").readOnly = false;
  document.getElementById("inputTelefone").readOnly = false;
  document.getElementById("inputPerfil").readOnly = true;
  document.getElementById("inputNotas").readOnly = false;
  document.getElementById("inputStatusEspecial").disabled = false;
  
  // Mostrar botão de salvar novamente
  const saveBtn = document.querySelector("#formEdicaoLead button[type='submit']");
  if (saveBtn) saveBtn.style.display = "flex";
  
  // Remover botão de restaurar do modal
  const restaurarBtn = document.getElementById("btnRestaurarModal");
  if (restaurarBtn) restaurarBtn.remove();
  
  document.getElementById("modalEdicao").style.display = "none";
};

window.copiarTexto = (texto) => {
  navigator.clipboard
    .writeText(texto)
    .then(() => showToast("Copiado! 📋", "success"));
};