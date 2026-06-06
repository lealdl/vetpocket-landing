/**
 * assets/js/adm/inativos.js
 * Gerenciamento de Leads Arquivados - VetPocket ADM
 */

// Variável global para controle
let currentLeads = [];

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📂 Carregando leads arquivados...");
    await carregarInativos();
    setupGlobalEvents();
});

// Carregar leads inativos
async function carregarInativos() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}ver-inativos.php`, {
            method: "GET",
            ...API_CONFIG.FETCH_OPTIONS,
        });

        if (!response.ok) throw new Error("Erro ao buscar inativos");

        const leads = await response.json();
        currentLeads = leads;

        // Atualiza os cards e renderiza a tabela
        atualizarCardsInativos(leads);
        renderizarTabela(leads);
    } catch (error) {
        console.error("❌ Erro:", error);
        showToast("Erro ao carregar leads arquivados", "error");
        
        const tableBody = document.getElementById("leads-table-body");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#dc2626;">
                <i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados. Tente novamente.
            </td></tr>`;
        }
    }
}

// Renderizar tabela
function renderizarTabela(leads) {
    const tableBody = document.getElementById("leads-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (leads.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#64748b;">
            <i class="fas fa-inbox"></i> Nenhum lead arquivado encontrado.
        </td></tr>`;
        return;
    }

    leads.forEach((lead) => {
        const dataBr = lead.data_cadastro
            ? new Date(lead.data_cadastro).toLocaleDateString("pt-BR")
            : "---";
        const row = document.createElement("tr");

        row.innerHTML = `
            <td data-label="Selecionar">
                <input type="checkbox" class="lead-checkbox" value="${escapeHtml(lead.id)}" onclick="event.stopPropagation()">
            </td>
            <td data-label="Nome">
                <strong>${escapeHtml(lead.nome)}</strong>
            </td>
            <td data-label="E-mail">${escapeHtml(lead.email)}</td>
            <td data-label="WhatsApp">${escapeHtml(lead.telefone || "---")}</td>
            <td class="desktop-only" data-label="Perfil">${escapeHtml(lead.perfil || "---")}</td>
            <td class="desktop-only" data-label="Data de Cadastro">${dataBr}</td>`;

        row.style.cursor = "pointer";
        row.onclick = (e) => {
            // Evita abrir o modal se clicou no checkbox
            if (!e.target.classList.contains('lead-checkbox')) {
                abrirModalInativo(lead, dataBr);
            }
        };
        tableBody.appendChild(row);
    });

    setupCheckboxLogic();
}

// Prevenir XSS
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Lógica dos checkboxes
function setupCheckboxLogic() {
    const selectAll = document.getElementById("selectAll");
    const checkboxes = document.querySelectorAll(".lead-checkbox");
    const btnRestaurar = document.getElementById("btnRestaurar");

    if (selectAll) {
        selectAll.checked = false;
        selectAll.onclick = () => {
            checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
            toggleActionsBtn();
        };
    }

    checkboxes.forEach((cb) => {
        cb.onchange = toggleActionsBtn;
    });

    function toggleActionsBtn() {
        const anyChecked = Array.from(checkboxes).some((c) => c.checked);
        if (btnRestaurar) {
            btnRestaurar.style.display = anyChecked ? "flex" : "none";
        }
    }
}

// Eventos globais
function setupGlobalEvents() {
    const btnRestaurar = document.getElementById("btnRestaurar");

    if (btnRestaurar) {
        btnRestaurar.onclick = async () => {
            const selectedCheckboxes = document.querySelectorAll(".lead-checkbox:checked");
            const ids = Array.from(selectedCheckboxes).map((cb) => cb.value);

            if (ids.length === 0) {
                showToast("Nenhum lead selecionado", "warning");
                return;
            }

            if (!confirm(`Restaurar ${ids.length} lead${ids.length > 1 ? 's' : ''} para a lista ativa?`)) return;

            // Desabilita o botão durante a operação
            const originalText = btnRestaurar.innerHTML;
            btnRestaurar.disabled = true;
            btnRestaurar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restaurando...';

            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}restaurar-leads.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids }),
                    credentials: "include",
                });

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

// Abrir modal de lead inativo
function abrirModalInativo(lead, dataBr) {
    // Preenche os dados no modal
    document.getElementById("modalId").value = lead.id;
    document.getElementById("inputNome").value = lead.nome || "";
    document.getElementById("inputEmail").value = lead.email || "";
    document.getElementById("inputTelefone").value = lead.telefone || "";
    document.getElementById("inputPerfil").value = lead.perfil || "---";
    document.getElementById("inputNotas").value = lead.notas_internas || "";
    document.getElementById("modalData").textContent = dataBr;
    document.getElementById("modalDataArquivamento").textContent = 
        lead.data_arquivamento ? new Date(lead.data_arquivamento).toLocaleDateString("pt-BR") : dataBr;
    
    // Motivo do arquivamento
    const motivoArquivamento = document.getElementById("inputMotivoArquivamento");
    if (motivoArquivamento) {
        motivoArquivamento.value = lead.motivo_arquivamento || "Não informado";
    }
    
    // Configura o status especial
    const statusSelect = document.getElementById("inputStatusEspecial");
    if (statusSelect && lead.status_especial) {
        statusSelect.value = lead.status_especial;
    }
    
    // Configura o link do WhatsApp
    const whatsappLink = document.getElementById("btnWhatsapp");
    if (whatsappLink && lead.telefone) {
        let telefone = lead.telefone.replace(/\D/g, '');
        if (!telefone.startsWith('55')) {
            telefone = '55' + telefone;
        }
        whatsappLink.href = `https://wa.me/${telefone}`;
        whatsappLink.style.opacity = "1";
        whatsappLink.style.cursor = "pointer";
    } else if (whatsappLink) {
        whatsappLink.href = "#";
        whatsappLink.style.opacity = "0.5";
        whatsappLink.style.cursor = "not-allowed";
    }
    
    // Torna os campos readonly para visualização
    const readonlyInputs = ["inputNome", "inputEmail", "inputTelefone", "inputNotas"];
    readonlyInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.readOnly = true;
            element.style.backgroundColor = "#f4f4f4";
            element.style.cursor = "not-allowed";
        }
    });
    
    // Desabilita o select de status especial
    if (statusSelect) {
        statusSelect.disabled = true;
        statusSelect.style.backgroundColor = "#f4f4f4";
        statusSelect.style.cursor = "not-allowed";
    }
    
    // Configura o botão de restaurar no modal
    const restaurarBtn = document.getElementById("btnRestaurarModal");
    if (restaurarBtn) {
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
    }
    
    // Adiciona classe para estilização específica
    const modal = document.getElementById("modalEdicao");
    if (modal) {
        modal.classList.add("modal-inativo");
        modal.style.display = "flex";
    }
}

// Fechar modal e restaurar estado original
window.fecharModal = function() {
    const modal = document.getElementById("modalEdicao");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-inativo");
    }
    
    // Restaura os campos para o estado editável
    const editableInputs = ["inputNome", "inputEmail", "inputTelefone", "inputNotas"];
    editableInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.readOnly = false;
            element.style.backgroundColor = "";
            element.style.cursor = "";
            element.value = "";
        }
    });
    
    // Habilita o select de status especial
    const statusSelect = document.getElementById("inputStatusEspecial");
    if (statusSelect) {
        statusSelect.disabled = false;
        statusSelect.style.backgroundColor = "";
        statusSelect.style.cursor = "";
        statusSelect.value = "Nenhum";
    }
    
    // Reseta o botão de restaurar
    const restaurarBtn = document.getElementById("btnRestaurarModal");
    if (restaurarBtn) {
        restaurarBtn.disabled = false;
        restaurarBtn.innerHTML = '<i class="fas fa-undo"></i> Restaurar Lead';
    }
    
    // Limpa campos extras
    const motivoInput = document.getElementById("inputMotivoArquivamento");
    if (motivoInput) motivoInput.value = "";
};

// Atualizar cards de estatísticas
function atualizarCardsInativos(leads) {
    const total = leads.length;

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

    // Atualiza os cards com animação
    const cards = [
        { id: "stat-total", value: total },
        { id: "stat-homecare", value: homecare },
        { id: "stat-clinica", value: clinica },
        { id: "stat-misto", value: misto }
    ];

    cards.forEach(card => {
        const element = document.getElementById(card.id);
        if (element && parseInt(element.textContent) !== card.value) {
            element.style.transform = "scale(1.1)";
            element.textContent = card.value;
            setTimeout(() => {
                if (element) element.style.transform = "scale(1)";
            }, 200);
        }
    });
}

// Setup header interactions (se não existir no components.js)
if (typeof setupHeaderInteractions !== "function") {
    window.setupHeaderInteractions = function() {
        if (window.headerEventsBound) return;
        window.headerEventsBound = true;

        document.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest("#mobileMenuBtn");

            if (toggleBtn) {
                const sidebar = document.querySelector(".adm-sidebar");
                const admOverlay = document.querySelector(".adm-overlay");

                if (sidebar) {
                    sidebar.classList.toggle("active");
                    if (admOverlay) {
                        admOverlay.classList.toggle("active");
                    }
                }
                return;
            }

            const isOverlay = e.target.classList.contains("adm-overlay");
            if (isOverlay) {
                const activeSidebar = document.querySelector(".adm-sidebar.active");
                if (activeSidebar) {
                    activeSidebar.classList.remove("active");
                    e.target.classList.remove("active");
                }
            }
        });
    };
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById("modalEdicao");
    if (event.target === modal) {
        fecharModal();
    }
};