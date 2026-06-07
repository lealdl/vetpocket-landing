/**
 * Gerenciamento de Cookies (LGPD/GDPR)
 * VetPocket - Versão corrigida para Firefox
 */

const CookieConsent = {
    COOKIE_KEY: 'vetpocket_cookie_consent',
    
    init() {
        console.log('🍪 Inicializando Cookie Consent...');
        this.checkConsent();
        this.setupEventListeners();
    },
    
    checkConsent() {
        try {
            const savedConsent = localStorage.getItem(this.COOKIE_KEY);
            const banner = document.getElementById('cookie-banner');
            
            if (!banner) {
                console.error('❌ Banner não encontrado');
                return;
            }
            
            // Se não há consentimento salvo, mostrar banner
            if (!savedConsent) {
                banner.style.display = 'block';
                console.log('✅ Banner exibido (sem consentimento)');
                return;
            }
            
            // Tentar fazer o parse do JSON
            let preferences = null;
            try {
                preferences = JSON.parse(savedConsent);
            } catch (e) {
                console.warn('⚠️ JSON inválido no localStorage, removendo...');
                localStorage.removeItem(this.COOKIE_KEY);
                banner.style.display = 'block';
                return;
            }
            
            // Se as preferências são válidas, aplicar
            if (preferences && typeof preferences === 'object') {
                banner.style.display = 'none';
                this.applyPreferences(preferences);
                console.log('✅ Preferências carregadas:', preferences);
            } else {
                // Preferências inválidas, mostrar banner
                localStorage.removeItem(this.COOKIE_KEY);
                banner.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Erro ao verificar consentimento:', error);
            const banner = document.getElementById('cookie-banner');
            if (banner) banner.style.display = 'block';
        }
    },
    
    applyPreferences(preferences) {
        if (preferences.functional) {
            this.enableFunctionalCookies();
        }
        if (preferences.analytics) {
            this.enableAnalyticsCookies();
        }
        if (preferences.marketing) {
            this.enableMarketingCookies();
        }
    },
    
    enableFunctionalCookies() {
        console.log('✅ Cookies funcionais ativados');
    },
    
    enableAnalyticsCookies() {
        console.log('✅ Cookies de análise ativados');
    },
    
    enableMarketingCookies() {
        console.log('✅ Cookies de marketing ativados');
    },
    
    setupEventListeners() {
        // Aceitar todos
        const acceptBtn = document.getElementById('cookie-accept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                try {
                    const preferences = {
                        essential: true,
                        functional: true,
                        analytics: true,
                        marketing: true
                    };
                    localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
                    this.applyPreferences(preferences);
                    const banner = document.getElementById('cookie-banner');
                    if (banner) banner.style.display = 'none';
                    console.log('✅ Cookies aceitos');
                } catch (error) {
                    console.error('❌ Erro ao aceitar cookies:', error);
                }
            });
        }
        
        // Recusar (apenas essenciais)
        const rejectBtn = document.getElementById('cookie-reject');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                try {
                    const preferences = {
                        essential: true,
                        functional: false,
                        analytics: false,
                        marketing: false
                    };
                    localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
                    this.applyPreferences(preferences);
                    const banner = document.getElementById('cookie-banner');
                    if (banner) banner.style.display = 'none';
                    console.log('✅ Apenas cookies essenciais');
                } catch (error) {
                    console.error('❌ Erro ao recusar cookies:', error);
                }
            });
        }
        
        // Abrir modal de configuração
        const configBtn = document.getElementById('cookie-config');
        if (configBtn) {
            configBtn.addEventListener('click', () => {
                this.openConfigModal();
            });
        }
        
        // Fechar modal
        const closeModalBtn = document.getElementById('close-cookie-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('cookie-modal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        // Salvar preferências
        const savePrefsBtn = document.getElementById('cookie-save-preferences');
        if (savePrefsBtn) {
            savePrefsBtn.addEventListener('click', () => {
                this.savePreferences();
            });
        }
        
        // Fechar modal ao clicar fora
        const modal = document.getElementById('cookie-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    },
    
    openConfigModal() {
        try {
            const savedConsent = localStorage.getItem(this.COOKIE_KEY);
            const modal = document.getElementById('cookie-modal');
            
            if (savedConsent) {
                try {
                    const prefs = JSON.parse(savedConsent);
                    const functionalCheckbox = document.getElementById('cookie-functional');
                    const analyticsCheckbox = document.getElementById('cookie-analytics');
                    const marketingCheckbox = document.getElementById('cookie-marketing');
                    
                    if (functionalCheckbox) functionalCheckbox.checked = prefs.functional || false;
                    if (analyticsCheckbox) analyticsCheckbox.checked = prefs.analytics || false;
                    if (marketingCheckbox) marketingCheckbox.checked = prefs.marketing || false;
                } catch (e) {
                    console.warn('Erro ao carregar preferências');
                }
            }
            
            if (modal) modal.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao abrir modal:', error);
        }
    },
    
    savePreferences() {
        try {
            const functionalCheckbox = document.getElementById('cookie-functional');
            const analyticsCheckbox = document.getElementById('cookie-analytics');
            const marketingCheckbox = document.getElementById('cookie-marketing');
            
            const preferences = {
                essential: true,
                functional: functionalCheckbox ? functionalCheckbox.checked : false,
                analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
                marketing: marketingCheckbox ? marketingCheckbox.checked : false
            };
            
            localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
            this.applyPreferences(preferences);
            
            const modal = document.getElementById('cookie-modal');
            const banner = document.getElementById('cookie-banner');
            
            if (modal) modal.style.display = 'none';
            if (banner) banner.style.display = 'none';
            
            console.log('✅ Preferências salvas:', preferences);
        } catch (error) {
            console.error('❌ Erro ao salvar preferências:', error);
        }
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CookieConsent.init();
    });
} else {
    CookieConsent.init();
}

// 🔥 FUNÇÕES GLOBAIS PARA DEBUG (disponíveis no console)
window.limparCookies = function() {
    try {
        localStorage.removeItem('vetpocket_cookie_consent');
        console.log('✅ Cookies limpos! Recarregue a página.');
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'block';
        return 'Cookies limpos com sucesso!';
    } catch(e) {
        console.error('Erro:', e);
        return 'Erro ao limpar cookies';
    }
};

window.verificarCookies = function() {
    try {
        const consent = localStorage.getItem('vetpocket_cookie_consent');
        if (consent) {
            console.log('Status:', JSON.parse(consent));
            return JSON.parse(consent);
        } else {
            console.log('Status: Nenhum consentimento');
            return null;
        }
    } catch(e) {
        console.error('Erro ao verificar:', e);
        return null;
    }
};

console.log('✅ Cookies.js carregado - Use limparCookies() para resetar');