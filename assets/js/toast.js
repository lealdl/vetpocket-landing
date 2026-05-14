function showToast(message, type = "success", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "check-circle" : "exclamation-circle";
  toast.innerHTML = `
      <span><i class="fas fa-${icon}"></i> ${message}</span>
  `;

  container.appendChild(toast);

  // Remove automaticamente
  const removeToast = () => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  };

  const timer = setTimeout(removeToast, duration);
  toast.onclick = () => {
    clearTimeout(timer);
    removeToast();
  };
}
