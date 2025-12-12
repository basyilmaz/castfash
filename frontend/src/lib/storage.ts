const TOKEN_KEY = "castfash-token";
const ORG_KEY = "castfash-organization";

interface Organization {
  id: number;
  name: string;
  remainingCredits: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export const authStorage = {
  save(token: string, organization: Organization) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ORG_KEY, JSON.stringify(organization));
  },
  token(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  organization(): Organization | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(ORG_KEY);
    return raw ? JSON.parse(raw) as Organization : null;
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ORG_KEY);
  },
};
