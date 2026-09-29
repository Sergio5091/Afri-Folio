// ============================================================
// Client HTTP de base — toutes les requêtes passent par ici
// ============================================================

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const TOKEN_KEY = "portfolio_token";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `HTTP ${response.status}`, response.status, data);
  }

  return data as T;
}

function authHeader(token?: string | null): Record<string, string> {
  const authToken = token ?? localStorage.getItem(TOKEN_KEY);
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function request<T>(method: string, path: string, body?: unknown, token?: string | null): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Connexion impossible. Vérifiez votre connexion internet.", 0);
  }
  return parse<T>(response);
}

/** Envoi d'un fichier (multipart/form-data) */
async function upload<T>(path: string, field: string, file: Blob, filename = "image.jpg"): Promise<T> {
  const form = new FormData();
  form.append(field, file, filename);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers: authHeader(), body: form });
  } catch {
    throw new ApiError("Connexion impossible. Vérifiez votre connexion internet.", 0);
  }
  return parse<T>(response);
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body ?? {}),
  delete: <T>(path: string, body?: unknown) => request<T>("DELETE", path, body),
  upload,
};

export { ApiError };
