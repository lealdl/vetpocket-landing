/**
 * Gerenciamento de Cookies (LGPD/GDPR)
 */

const CookieConsent = {
    COOKIE_KEY: 'vetpocket_cookie_consent',
    
    init() {
        this.checkConsent();
        this.setupEventListeners();
    },
    
    checkConsent() {
        const savedConsent = localStorage.getItem(this.COOKIE_KEY);
        
        if (!savedConsent) {
            // Mostrar banner se nunca consentiu
            document.getElementById('cookie-banner').style.display = 'block';
        } else {
            // Aplicar preferências salvas
            const preferences = JSON.parse(savedConsent);
            this.applyPreferences(preferences);
        }
    },
    
    applyPreferences(preferences) {
        // Cookies essenciais sempre ativos
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
        // Adicione aqui seus scripts funcionais
        // Ex: salvar preferências de idioma
    },
    
    enableAnalyticsCookies() {
        console.log('✅ Cookies de análise ativados');
        // Adicione aqui Google Analytics, etc.
        // Exemplo Google Analytics:
        // if (typeof gtag !== 'undefined') gtag('consent', 'update', { analytics_storage: 'granted' });
    },
    
    enableMarketingCookies() {
        console.log('✅ Cookies de marketing ativados');
        // Adicione aqui pixels de marketing, Facebook, etc.
    },
    
    disableAnalyticsCookies() {
        console.log('❌ Cookies de análise desativados');
        // Exemplo Google Analytics:
        // if (typeof gtag !== 'undefined') gtag('consent', 'update', { analytics_storage: 'denied' });
    },
    
    setupEventListeners() {
        // Aceitar todos
        document.getElementById('cookie-accept')?.addEventListener('click', () => {
            const preferences = {
                essential: true,
                functional: true,
                analytics: true,
                marketing: true
            };
            localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
            this.applyPreferences(preferences);
            document.getElementById('cookie-banner').style.display = 'none';
        });
        
        // Recusar (apenas essenciais)
        document.getElementById('cookie-reject')?.addEventListener('click', () => {
            const preferences = {
                essential: true,
                functional: false,
                analytics: false,
                marketing: false
            };
            localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
            this.applyPreferences(preferences);
            document.getElementById('cookie-banner').style.display = 'none';
        });
        
        // Abrir modal de configuração
        document.getElementById('cookie-config')?.addEventListener('click', () => {
            this.openConfigModal();
        });
        
        // Fechar modal
        document.getElementById('close-cookie-modal')?.addEventListener('click', () => {
            document.getElementById('cookie-modal').style.display = 'none';
        });
        
        // Salvar preferências
        document.getElementById('cookie-save-preferences')?.addEventListener('click', () => {
            this.savePreferences();
        });
        
        // Fechar modal ao clicar fora
        document.getElementById('cookie-modal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('cookie-modal')) {
                document.getElementById('cookie-modal').style.display = 'none';
            }
        });
    },
    
    openConfigModal() {
        const savedConsent = localStorage.getItem(this.COOKIE_KEY);
        if (savedConsent) {
            const prefs = JSON.parse(savedConsent);
            document.getElementById('cookie-functional').checked = prefs.functional || false;
            document.getElementById('cookie-analytics').checked = prefs.analytics || false;
            document.getElementById('cookie-marketing').checked = prefs.marketing || false;
        }
        document.getElementById('cookie-modal').style.display = 'flex';
    },
    
    savePreferences() {
        const preferences = {
            essential: true,
            functional: document.getElementById('cookie-functional').checked,
            analytics: document.getElementById('cookie-analytics').checked,
            marketing: document.getElementById('cookie-marketing').checked
        };
        localStorage.setItem(this.COOKIE_KEY, JSON.stringify(preferences));
        this.applyPreferences(preferences);
        document.getElementById('cookie-modal').style.display = 'none';
        document.getElementById('cookie-banner').style.display = 'none';
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    CookieConsent.init();
});