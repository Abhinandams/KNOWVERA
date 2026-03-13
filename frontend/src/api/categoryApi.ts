import { api } from "./client";

export const getCategories = async () => {
  const { data } = await api.get<string[]>("/v1/categories");
  return Array.isArray(data) ? data : [];
};

