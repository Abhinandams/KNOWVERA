import { api } from "./client";

export type Issue = {
  issueId: number;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string | null;
  status?: string;
  user?: {
    userId?: number;
    fname?: string;
    lname?: string;
  };
  book?: {
    bookId?: number;
    title?: string;
  };
};

export const getIssues = async (params?: { fname?: string; lname?: string }) => {
  const { data } = await api.get<Issue[]>("/v1/issues", { params });
  return data;
};

export const createIssue = async (payload: { userId: number; bookId: number }) => {
  const { data } = await api.post<Issue>("/v1/issues", {
    user_id: payload.userId,
    book_id: payload.bookId,
  });
  return data;
};

export const returnIssue = async (issueId: number | string) => {
  const { data } = await api.put<Issue>(`/v1/issues/${issueId}`);
  return data;
};
