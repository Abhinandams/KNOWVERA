import { api } from "./client";

export type PaymentSummary = {
  paymentId?: number;
  fineId?: number;
  amountPaid?: number | string;
  paymentMethod?: string;
  paymentDate?: string;
};

export const getAdminPayments = async () => {
  const { data } = await api.get<PaymentSummary[]>("/v1/admin/payments");
  return data;
};

export const payFine = async (payload: {
  fineId: number;
  amountPaid: number;
  paymentMethod?: string;
}) => {
  const { data } = await api.post("/v1/payments", {
    fine_id: payload.fineId,
    amount_paid: payload.amountPaid,
    payment_method: payload.paymentMethod ?? "cash",
  });
  return data;
};
