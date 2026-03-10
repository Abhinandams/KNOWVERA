import { api } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId?: number | string;
  role?: string;
  email?: string;
};

const readString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const normalizeLoginResponse = (payload: unknown): LoginResponse => {
  const data = (payload ?? {}) as Record<string, unknown>;
  const user = (data.user ?? {}) as Record<string, unknown>;

  const token =
    readString(data.token) ||
    readString(data.accessToken) ||
    readString(data.jwt) ||
    readString(data.jwtToken) ||
    readString(data.access_token);

  if (!token) {
    throw new Error("Login response did not include a token.");
  }

  const role =
    readString(data.role) ||
    readString(user.role) ||
    readString((Array.isArray(data.roles) ? data.roles[0] : undefined));

  const userId = (data.userId ?? user.userId ?? user.id) as number | string | undefined;
  const email = readString(data.email) || readString(user.email);

  return {
    token,
    role,
    userId,
    email,
  };
};

export const login = async (payload: LoginRequest) => {
  const { data } = await api.post("/v1/auth/login", payload);
  return normalizeLoginResponse(data);
};

export const register = async (payload: Record<string, unknown>) => {
  const { data } = await api.post("/v1/auth/register", payload);
  return data;
};
