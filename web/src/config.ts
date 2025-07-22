export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "localhost:5056";
const WS = import.meta.env.VITE_WS || "ws"; // Use "wss" when deploying the app
const HTTP = import.meta.env.VITE_HTTP || "http"; // Use "https" when deploying the app

export const API_URL = `${HTTP}://${API_BASE_URL}/api`;
export const WS_URL = `${WS}://${API_BASE_URL}/api/ws`;

