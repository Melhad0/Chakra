/**
 * Configuração central de URL de API para ambiente local e produção.
 * Se VITE_API_BASE_URL estiver definida (ex: no Vercel), ela é prefixada.
 * Caso contrário, usa caminhos relativos (/api/...) roteados pelo Vite ou Nginx.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
