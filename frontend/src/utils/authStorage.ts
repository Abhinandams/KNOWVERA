const AUTH_KEYS = ["userId", "role", "email"] as const;

export type AuthKey = (typeof AUTH_KEYS)[number];

const REMEMBERED_EMAIL_KEY = "rememberedEmail";

export const getAuthItem = (key: AuthKey): string | null => {
  // Prefer sessionStorage so non-remembered sessions work without persisting.
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
};

export const setAuthItem = (key: AuthKey, value: string, persist: boolean) => {
  if (persist) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  }
};

export const setAuthSession = (payload: Partial<Record<AuthKey, string>>, persist: boolean) => {
  for (const key of AUTH_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) {
      setAuthItem(key, value, persist);
    } else {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }
};

export const clearAuthSession = () => {
  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const getRememberedEmail = (): string => {
  return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
};

export const setRememberedEmail = (email: string) => {
  const value = email.trim();
  if (value) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, value);
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
};

