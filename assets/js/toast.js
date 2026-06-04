console.log("✅ Arquivo toast.js carregado com sucesso!");

let toastTimer = null;

function showToast(message, type = "success") {
  console.log(
    `%c 🔔 TOAST: ${message}`,
    "color: yellow; background: black; font-weight: bold;",
  );

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    container.appendChild(toast);
  }

  clearTimeout(toastTimer);
  toast.className = `toast ${type}`;
  toast.textContent = message;

  setTimeout(() => {
    toast.classList.add("show");

    // Debug de posição
    const rect = toast.getBoundingClientRect();
    console.log("📏 Posição do Toast:", rect.top, "px do topo");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }, 50);
}
