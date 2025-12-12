import { apiFetch } from "./http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  organization: {
    id: number;
    name: string;
    remainingCredits: number;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: number;
    email: string;
    isEmailVerified: boolean;
    isSuperAdmin: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
};

export type SignupRequest = {
  email: string;
  password: string;
  organizationName: string;
};

export type SignupResponse = LoginResponse;

export type RefreshRequest = {
  token: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: data,
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem("castfash_access_token", res.accessToken);
  }
  return res;
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const res = await apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: data,
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem("castfash_access_token", res.accessToken);
  }
  return res;
}

export async function refresh(data: RefreshRequest): Promise<RefreshResponse> {
  try {
    const res = await apiFetch<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: data,
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("castfash_access_token", res.accessToken);
    }
    return res;
  } catch (err) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("castfash_access_token");
    }
    throw err;
  }
}

export async function getCurrentOrganization(): Promise<{
  organization: {
    id: number;
    name: string;
    remainingCredits: number;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
  };
  role: string | null;
}> {
  return apiFetch("/me/organization");
}
