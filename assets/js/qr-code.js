/**
 * New-VetPocket - Gerador de QR Code Automático
 */
document.addEventListener("DOMContentLoaded", function () {
  const qrcodeElement = document.getElementById("qrcode");

  if (qrcodeElement) {
    // 1. Limpa o elemento para evitar duplicatas e erros de URI
    qrcodeElement.innerHTML = "";

    // 2. Remove o atributo title ANTES da criação para evitar o erro do base path
    qrcodeElement.removeAttribute("title");

    // 3. Pega a URL de forma segura (sem hashes que confundem a Vercel)
    const pureUrl = window.location.href.split("#")[0];

    try {
      new QRCode(qrcodeElement, {
        text: pureUrl,
        width: 100,
        height: 100,
        colorDark: "#6a1b9a", // Roxo da marca New-VetPocket
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      // 4. Força um title limpo após a geração para sobrescrever o erro da lib
      setTimeout(() => {
        const img = qrcodeElement.querySelector("img");
        if (img) img.removeAttribute("title");
        qrcodeElement.setAttribute("title", "Escaneie para abrir no celular");
      }, 100);
    } catch (err) {
      console.error("Erro ao gerar QR Code:", err);
    }
  }
});
