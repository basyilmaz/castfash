const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("castfash_access_token");
}

// Custom error class for rate limiting
export class RateLimitError extends Error {
  retryAfter: number;

  constructor(message: string, retryAfter: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const body =
    options.body && typeof options.body === "object" && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });

  if (!res.ok) {
    // Handle rate limiting (429 Too Many Requests)
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
      throw new RateLimitError(
        'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
        retryAfter
      );
    }

    // Handle unauthorized (401)
    if (res.status === 401) {
      // Clear token and redirect to login if on client
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/')) {
          window.localStorage.removeItem("castfash_access_token");
          // Don't redirect immediately, let the component handle it
        }
      }
      throw new ApiError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', 401);
    }

    // Handle forbidden (403)
    if (res.status === 403) {
      throw new ApiError('Bu işlem için yetkiniz yok.', 403);
    }

    // Handle other errors
    let message = "İstek başarısız";
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      try {
        message = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new ApiError(message, res.status);
  }

  // Some responses may be empty (204)
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
