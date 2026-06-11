/**
 * ROLAGEM SUAVE MANUAL - VETPOCKET
 * Com animação controlada para rolagem mais suave
 */

(function() {
    // Duração da animação em milissegundos
    const DURACAO = 600; // 600ms = 0.6 segundos
    
    // Função de easing (curva de aceleração) - cubic-bezier
    function easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Função de rolagem suave manual
    function smoothScrollTo(targetY, duracao = DURACAO) {
        const startY = window.pageYOffset;
        const distancia = targetY - startY;
        const startTime = performance.now();
        
        function animacao(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duracao, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startY + distancia * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animacao);
            }
        }
        
        requestAnimationFrame(animacao);
    }
    
    // Função para obter a altura do header
    function getHeaderHeight() {
        const header = document.querySelector('.navbar, .adm-header, header');
        if (header) {
            return header.offsetHeight;
        }
        return 80;
    }
    
    // Função principal de rolagem para elemento
    function scrollToElement(element, offset = null) {
        if (!element) return;
        
        const headerHeight = offset !== null ? offset : getHeaderHeight();
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        smoothScrollTo(offsetPosition, DURACAO);
    }
    
    // Configurar os links
    function setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Ignora links que não são âncoras válidas
            if (!href || href === '#' || href === '' || href === 'javascript:void(0)') return;
            if (!href.startsWith('#')) return;
            
            // Remove evento anterior e adiciona novo
            link.removeEventListener('click', handleClick);
            link.addEventListener('click', handleClick);
        });
    }
    
    function handleClick(e) {
        const href = this.getAttribute('href');
        const targetId = href.substring(1); // remove o #
        
        // Verifica se o elemento existe
        const target = document.getElementById(targetId);
        
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            
            const headerHeight = getHeaderHeight();
            
            // Rola suavemente
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            smoothScrollTo(offsetPosition, DURACAO);
            
            // Fecha menu mobile se existir
            const navLinks = document.getElementById('navLinks');
            const menuOverlay = document.getElementById('menuOverlay');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
            }
            
            // Atualiza URL sem recarregar (opcional - comente se não quiser)
            history.pushState(null, null, href);
        }
    }
    
    // Verificar hash na URL ao carregar
    function checkHashOnLoad() {
        if (window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    const headerHeight = getHeaderHeight();
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    smoothScrollTo(offsetPosition, DURACAO);
                }
            }, 300);
        }
    }
    
    // Observar quando o header for carregado dinamicamente
    function waitForHeader() {
        const observer = new MutationObserver(() => {
            const header = document.querySelector('.navbar, .adm-header, header');
            if (header) {
                observer.disconnect();
                setupSmoothScroll();
                checkHashOnLoad();
                console.log(`✅ Rolagem suave configurada - Duração: ${DURACAO}ms`);
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Tentativa inicial
        setTimeout(() => {
            if (document.querySelector('.navbar, .adm-header, header')) {
                observer.disconnect();
                setupSmoothScroll();
                checkHashOnLoad();
                console.log(`✅ Rolagem suave configurada - Duração: ${DURACAO}ms`);
            }
        }, 500);
    }
    
    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForHeader);
    } else {
        waitForHeader();
    }
})();