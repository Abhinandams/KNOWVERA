import { api } from "./client";

export type Fine = {
  fineId: number;
  totalFineAmount?: number | string;
  remainingFineAmount?: number | string;
  fineStatus?: string;
  issue?: {
    issueId?: number;
    issueDate?: string;
    user?: {
      userId?: number;
      fname?: string;
      lname?: string;
    };
    book?: {
      title?: string;
    };
  };
};

export const getAdminFines = async () => {
  const { data } = await api.get<Fine[]>("/v1/admin/fines");
  return data;
};
