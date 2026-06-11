// assets/js/funcoes.js

/**
 * Aplica máscara de telefone com DDD no campo de input
 * Formato: (99) 99999-9999 ou (99) 9999-9999
 * @param {HTMLInputElement} inputElement - O elemento input que receberá a máscara
 */
function aplicarMascaraTelefone(inputElement) {
    if (!inputElement) return;
    
    inputElement.addEventListener('input', function(e) {
        let valor = this.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (valor.length > 0) {
            // Aplica a máscara (99) 99999-9999
            if (valor.length <= 2) {
                valor = valor.replace(/^(\d{0,2})/, '($1');
            } else if (valor.length <= 7) {
                valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        this.value = valor;
    });
}

/**
 * Remove a máscara do telefone, retornando apenas números
 * @param {string} telefoneMasked - Telefone com máscara
 * @returns {string} - Apenas os números do telefone
 */
function limparMascaraTelefone(telefoneMasked) {
    if (!telefoneMasked) return '';
    return telefoneMasked.replace(/\D/g, '');
}

/**
 * Aplica máscara de telefone em um campo específico pelo ID
 * @param {string} inputId - ID do elemento input
 */
function initMascaraTelefone(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        aplicarMascaraTelefone(input);
    } else {
        console.warn(`Elemento com ID "${inputId}" não encontrado`);
    }
}