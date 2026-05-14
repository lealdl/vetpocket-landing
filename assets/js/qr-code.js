/**
 * VetPocket - Gerador de QR Code Automático
 * Abre a página atual no celular para facilitar a navegação.
 */
document.addEventListener("DOMContentLoaded", function () {
  const qrcodeElement = document.getElementById("qrcode");

  if (qrcodeElement) {
    // 1. Limpa o QR Code anterior (evita duplicatas e lixo visual)
    qrcodeElement.innerHTML = "";

    // 2. Captura a URL EXATA que está no navegador agora
    const currentUrl = window.location.href;

    new QRCode(qrcodeElement, {
      text: currentUrl,
      width: 100,
      height: 100,
      colorDark: "#6a1b9a", // Roxo da marca VetPocket
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    // 3. Força o 'title' a ser igual à URL atual
    qrcodeElement.title = currentUrl;

    console.log("📱 QR Code gerado para: " + currentUrl);
  }
});
