const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_CONFIG = {
  BASE_URL: isLocal
    ? "http://127.0.0.1/backend-landing/"
    : "https://llrh.com.br/backend-landing/",

  FETCH_OPTIONS: {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  },
};
