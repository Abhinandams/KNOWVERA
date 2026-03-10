import { api } from "./client";

export type Reservation = {
  reservationId: number;
  reservedOn?: string;
  expectedReturnDate?: string | null;
  status?: string;
  expiryDate?: string | null;
  user?: {
    userId?: number;
    fname?: string;
    lname?: string;
    email?: string;
  };
  book?: {
    bookId?: number;
    title?: string;
    isbn?: string;
  };
};

export const getReservations = async () => {
  const { data } = await api.get<Reservation[]>("/v1/reservations");
  return data;
};

export const createReservation = async (payload: { bookId: number; userId?: number }) => {
  const { data } = await api.post<Reservation>("/v1/reservations", {
    book_id: payload.bookId,
    user_id: payload.userId,
  });
  return data;
};

export const updateReservationStatus = async (
  reservationId: number | string,
  action: "cancel" | "collect"
) => {
  const { data } = await api.patch<Reservation>(`/v1/reservations/${reservationId}`, null, {
    params: { action },
  });
  return data;
};
