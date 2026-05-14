const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_CONFIG = {
  BASE_URL: isLocal
    ? "http://127.0.0.1/backend-landing/"
    : "https://llrh.com.br/backend-landing/", // Certifique-se de manter a barra final

  FETCH_OPTIONS: {
    // credentials: "include" pode causar erros em requisições cross-origin (CORS)
    // se o servidor não estiver configurado para domínios específicos.
    headers: {
      "Content-Type": "application/json",
    },
  },
};
