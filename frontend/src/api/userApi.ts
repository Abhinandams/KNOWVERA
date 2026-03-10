import { api } from "./client";

export type UserResponse = {
  userId: number;
  fname: string;
  lname: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
  status?: string | null;
  profileImage?: string | null;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type CreateUserPayload = {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: string;
  image?: File;
};

export type UpdateUserPayload = {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
  status?: string;
};

const DEFAULT_PROFILE_IMAGE = "https://i.pinimg.com/736x/d7/b9/48/d7b948ff970f7d92ee265072da06fd07.jpg";

export const resolveUserProfileImage = (profileImage?: string | null) => {
  const image = (profileImage ?? "").trim();
  if (!image) return DEFAULT_PROFILE_IMAGE;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  try {
    const base = new URL(String(api.defaults.baseURL ?? window.location.origin));
    return `${base.origin}${image.startsWith("/") ? image : `/${image}`}`;
  } catch {
    return image;
  }
};

export const getAdminUsers = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const { data } = await api.get<PagedResponse<UserResponse>>("/v1/admin/users", { params });
  return data;
};

export const getAdminUserById = async (userId: number | string) => {
  const { data } = await api.get<UserResponse>(`/v1/admin/users/${userId}`);
  return data;
};

export const createAdminUser = async (payload: CreateUserPayload) => {
  const formData = new FormData();
  formData.append("fname", payload.fname);
  formData.append("lname", payload.lname);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  if (payload.phone) formData.append("phone", payload.phone);
  if (payload.address) formData.append("address", payload.address);
  if (payload.image) formData.append("image", payload.image);

  const { data } = await api.post<UserResponse>("/v1/admin/users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateAdminUser = async (userId: number | string, payload: UpdateUserPayload) => {
  const { data } = await api.put<UserResponse>(`/v1/admin/users/${userId}`, payload);
  return data;
};

export const deleteAdminUser = async (userId: number | string) => {
  const { data } = await api.delete(`/v1/admin/users/${userId}`);
  return data;
};
