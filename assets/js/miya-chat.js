// assets/js/miya-chat.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando chat Miya-ko...');
    
    const miyaBtn = document.getElementById('miya-chat-btn');
    const miyaModal = document.getElementById('miya-chat-modal');
    const miyaCloseBtn = document.getElementById('miya-close-btn');
    const miyaSendBtn = document.getElementById('miya-send-btn');
    const miyaInput = document.getElementById('miya-user-input');
    const miyaMessages = document.getElementById('miya-chat-messages');
    let aguardandoNome = true;
    let nomeUsuario = '';

    if (!miyaBtn) {
        console.error('❌ Botão Miya-ko não encontrado!');
        return;
    }

    console.log('✅ Elementos encontrados');

    function adicionarVoltarAoInicio(opcoes) {
        if (!opcoes) return ['🔙 Voltar ao início', '🚪 Sair'];
        if (!opcoes.includes('🔙 Voltar ao início')) {
            opcoes = [...opcoes, '🔙 Voltar ao início'];
        }
        if (!opcoes.includes('🚪 Sair')) {
            opcoes = [...opcoes, '🚪 Sair'];
        }
        return opcoes;
    }

    function adicionarOpcaoSair(opcoes) {
        if (!opcoes) return ['🚪 Sair'];
        if (!opcoes.includes('🚪 Sair')) {
            return [...opcoes, '🚪 Sair'];
        }
        return opcoes;
    }

    function openChat() {
        console.log('📂 Abrindo chat...');
        miyaModal.classList.add('show');
        miyaInput.focus();
        if (miyaMessages.children.length === 0) {
            addMessage('🐾 Olá! Sou a Miya-ko! 😊\n\nComo posso chamar você?', false);
        }
    }

    function closeChat() {
        console.log('📂 Fechando chat...');
        miyaModal.classList.remove('show');
    }

    function addMessage(text, isUser = false, opcoes = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `miya-message ${isUser ? 'user' : 'bot'}`;
        
        if (!isUser) {
            const avatar = document.createElement('div');
            avatar.className = 'miya-avatar';
            avatar.innerHTML = '<img src="assets/img/logo_miyako-rouded.webp" alt="Miya">';
            messageDiv.appendChild(avatar);
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'miya-bubble';
        bubble.innerHTML = text.replace(/\n/g, '<br>');
        
        if (opcoes && opcoes.length > 0) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'miya-options';
            opcoes.forEach(opcao => {
                const btn = document.createElement('button');
                btn.className = 'miya-option';
                btn.textContent = opcao;
                btn.setAttribute('data-opcao', opcao);
                btn.onclick = (function(opt) {
                    return function() { handleOptionClick(opt); };
                })(opcao);
                optionsDiv.appendChild(btn);
            });
            bubble.appendChild(optionsDiv);
        }
        
        messageDiv.appendChild(bubble);
        miyaMessages.appendChild(messageDiv);
        miyaMessages.scrollTop = miyaMessages.scrollHeight;
    }

    function fecharComAgradecimento() {
        const nome = nomeUsuario || 'usuário';
        addMessage(`🐾 Foi um prazer conversar com você, ${nome}! 💙\n\nAgradecemos muito pelo seu interesse!\n\nEstamos aqui sempre que precisar. 🐾`, false, ['🔙 Voltar ao início']);
        setTimeout(() => {
            miyaModal.classList.remove('show');
        }, 5000);
    }

    function sendMessage() {
        const text = miyaInput.value.trim();
        if (!text) return;
        
        addMessage(text, true);
        miyaInput.value = '';
        
        setTimeout(() => {
            if (aguardandoNome) {
                aguardandoNome = false;
                nomeUsuario = text;
                addMessage(`🐾 Prazer em te conhecer, ${nomeUsuario}! 💙\n\nSobre o que você gostaria de saber?`, false, adicionarOpcaoSair([
                    '⚙️ Como funciona o sistema?',
                    '💰 Preços',
                    '🎨 Personalização',
                    '📞 Contato'
                ]));
                return;
            }
            
            let resposta = '';
            let opcoesResposta = [];
            const msg = text.toLowerCase();
            
            if (msg.includes('funciona') || msg.includes('sistema')) {
                resposta = '🐾 O VetPocket é um sistema de gestão completo para clínicas veterinárias!\n\n✅ Prontuário digital\n✅ Agenda de atendimentos\n✅ Controle de vacinas\n✅ Relatórios gerenciais\n✅ Personalização com sua logo\n\nQuer saber mais sobre alguma funcionalidade?';
                opcoesResposta = adicionarVoltarAoInicio(['📋 Prontuário', '📅 Agenda', '💉 Vacinas', '🎨 Personalização']);
            }
            else if (msg.includes('preço') || msg.includes('valor')) {
                resposta = '💰 Plano Vitalício: R$ 942,90 à vista ou 12x R$ 134,70\n\nInclui instalação, configuração e suporte.\n\n🆓 Demonstração gratuita disponível!';
                opcoesResposta = adicionarVoltarAoInicio(['🎁 Quero uma demonstração', '📞 Falar com vendas']);
            }
            else if (msg.includes('contato') || msg.includes('telefone') || msg.includes('whatsapp')) {
                resposta = '📱 Canais de atendimento:\n\n📞 Telefone: (44) 4444-4444\n📱 WhatsApp: (44) 99999-9999\n✉️ Email: vendas@vetpocket.com\n\nPosso abrir o WhatsApp para você?';
                opcoesResposta = adicionarVoltarAoInicio(['💬 Abrir WhatsApp']);
            }
            else if (msg.includes('demo') || msg.includes('demonstração')) {
                resposta = '🎉 Ótimo! Vamos agendar sua demonstração gratuita.\n\nPosso te ajudar a marcar?';
                opcoesResposta = adicionarVoltarAoInicio(['📞 Abrir WhatsApp', '✉️ Enviar email']);
            }
            else if (msg.includes('personalização') || msg.includes('logo') || msg.includes('cores')) {
                resposta = '🎨 O sistema é 100% personalizável com sua marca!\n\n✅ Logo da sua clínica\n✅ Cores personalizadas\n✅ Nome da sua empresa\n✅ Mascote exclusivo\n✅ URL personalizada\n\nSua identidade visual em destaque!';
                opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
            }
            else if (msg.includes('obrigado') || msg.includes('valeu')) {
                resposta = '🐾 Por nada! Estamos aqui para ajudar você a melhorar a gestão da sua clínica! 💙\n\nTem mais alguma dúvida?';
                opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
            }
            else {
                resposta = '🐾 Sobre o que você gostaria de saber?';
                opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '🎨 Personalização', '📞 Contato']);
            }
            
            addMessage(resposta, false, opcoesResposta);
        }, 500);
    }

    function handleOptionClick(opcao) {
        console.log('🔘 Opção clicada:', opcao);
        
        if (opcao === '🚪 Sair') {
            fecharComAgradecimento();
            return;
        }
        
        addMessage(opcao, true);
        
        setTimeout(() => {
            let resposta = '';
            let opcoesResposta = [];
            
            switch(opcao) {
                case '⚙️ Como funciona o sistema?':
                    resposta = '🐾 O VetPocket é um sistema de gestão completo para clínicas veterinárias!\n\n✅ Prontuário digital\n✅ Agenda de atendimentos\n✅ Controle de vacinas\n✅ Relatórios gerenciais\n✅ Personalização com sua logo\n\nQuer saber mais sobre alguma funcionalidade?';
                    opcoesResposta = adicionarVoltarAoInicio(['📋 Prontuário', '📅 Agenda', '💉 Vacinas', '🎨 Personalização']);
                    break;
                    
                case '📋 Prontuário':
                    resposta = '📋 O prontuário digital permite:\n\n• Histórico completo do paciente\n• Registro de consultas\n• Receitas e exames anexados\n• Exportar para PDF\n• Acesso de qualquer lugar';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
                    break;
                    
                case '📅 Agenda':
                    resposta = '📅 Nossa agenda inteligente oferece:\n\n• Visualização diária/semanal/mensal\n• Controle de horários\n• Lembretes automáticos\n• Gestão de profissionais';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
                    break;
                    
                case '💉 Vacinas':
                    resposta = '💉 Controle de vacinas completo:\n\n• Cadastro de vacinas\n• Alertas de vencimento\n• Histórico do paciente\n• Calendário vacinal\n• Notificações automáticas';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
                    break;
                    
                case '🎨 Personalização':
                    resposta = '🎨 O sistema é 100% personalizável!\n\n✅ Logo da sua clínica\n✅ Cores personalizadas\n✅ Nome da sua empresa\n✅ Mascote exclusivo\n✅ URL personalizada';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
                    break;
                    
                case '💰 Preços':
                    resposta = '💳 Plano Vitalício: R$ 942,90 à vista ou 12x R$ 134,70\n\nInclui instalação, configuração e suporte.\n\n🆓 Demonstração gratuita disponível!';
                    opcoesResposta = adicionarVoltarAoInicio(['🎁 Quero uma demonstração', '📞 Falar com vendas']);
                    break;
                    
                case '🎁 Quero uma demonstração':
                    resposta = '🎉 Excelente! Vamos agendar uma demonstração gratuita para você.\n\nPosso anotar seu melhor email e telefone?\n\nOu você já pode agendar diretamente pelo WhatsApp!';
                    opcoesResposta = adicionarVoltarAoInicio(['📞 Abrir WhatsApp', '✉️ Enviar email']);
                    break;
                    
                case '📞 Falar com vendas':
                    resposta = '📱 Nossa equipe de vendas: WhatsApp (44) 99999-9999\n\nQuer abrir o WhatsApp agora?';
                    opcoesResposta = adicionarVoltarAoInicio(['💬 Abrir WhatsApp']);
                    break;
                    
                case '📞 Contato':
                    resposta = '📱 Canais de atendimento:\n\n📞 Telefone: (44) 4444-4444\n📱 WhatsApp: (44) 99999-9999\n✉️ Email: vendas@vetpocket.com';
                    opcoesResposta = adicionarVoltarAoInicio(['💬 Abrir WhatsApp']);
                    break;
                    
                case '💬 Abrir WhatsApp':
                    window.open('https://wa.me/5544999999999', '_blank');
                    resposta = '📱 WhatsApp aberto! Nossa equipe te atenderá em breve. 🐾';
                    opcoesResposta = adicionarVoltarAoInicio([]);
                    break;
                    
                case '✉️ Enviar email':
                    window.location.href = 'mailto:vendas@vetpocket.com';
                    resposta = '✉️ Email aberto! Aguardamos seu contato.';
                    opcoesResposta = adicionarVoltarAoInicio([]);
                    break;
                    
                case '🔙 Voltar ao início':
                    resposta = '🐾 Sobre o que você gostaria de saber?';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '🎨 Personalização', '📞 Contato']);
                    break;
                    
                default:
                    resposta = '🐾 Em breve nossa equipe entrará em contato!\n\nPosso ajudar com mais alguma coisa?';
                    opcoesResposta = adicionarVoltarAoInicio(['⚙️ Como funciona o sistema?', '💰 Preços', '📞 Contato']);
            }
            
            addMessage(resposta, false, opcoesResposta);
        }, 500);
    }

    miyaBtn.addEventListener('click', openChat);
    miyaCloseBtn.addEventListener('click', closeChat);
    miyaSendBtn.addEventListener('click', sendMessage);
    miyaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    window.addEventListener('click', function(e) {
        if (e.target === miyaModal) closeChat();
    });

    console.log('✅ Chat Miya-ko carregado com sucesso!');
});