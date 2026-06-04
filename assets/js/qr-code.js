/**
 * VetHome - Gerador de QR Code
 * Gera automaticamente o QR Code para acesso mobile
 */

document.addEventListener("DOMContentLoaded", function () {
  const qrcodeElement = document.getElementById("qrcode");

  if (qrcodeElement) {
    new QRCode(qrcodeElement, {
      // Usa a URL atual (funciona na Vercel ou Localhost automaticamente)
      text: window.location.href,
      width: 100,
      height: 100,
      colorDark: "#4f46e5", // Roxo moderno do tema VetHome
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } else {
    console.warn("Elemento #qrcode não encontrado no DOM.");
  }
});
