import { api } from "./client";

export type Book = {
  id: number;
  bookId?: number;
  title: string;
  author?: string;
  authors?: string[];
  categories?: string[];
  category?: string;
  isbn?: string;
  publisher?: string;
  image?: string;
  availableCopies?: number;
  available_copies?: number;
  totalCopies?: number;
  total_copies?: number;
  isDeleted?: boolean;
  is_deleted?: boolean;
  description?: string;
  firstPublished?: string;
  first_published?: string;
  language?: string;
  edition?: string;
};

export type BookPageResponse = {
  content: Book[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

export const getBooks = async (params?: { page?: number; size?: number; sort?: string }) => {
  const { data } = await api.get<BookPageResponse>("/v1/books", { params });
  return data;
};

export const getAllBooks = async () => {
  const all: Book[] = [];
  const seenIds = new Set<number>();
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await getBooks({ page, size: 100, sort: "bookId" });
    if (Array.isArray(res.content)) {
      for (const book of res.content) {
        const id = Number(book.bookId ?? book.id ?? 0);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          all.push(book);
        }
      }
    }
    totalPages = Number(res.totalPages ?? 1);
    page += 1;
  }

  return all;
};

export const getBookById = async (id: number | string) => {
  const { data } = await api.get<Book>(`/v1/books/${id}`);
  return data;
};

export const searchBooks = async (params?: {
  title?: string;
  author?: string;
  category?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const { data } = await api.get<BookPageResponse>("/v1/books/search", {
    params,
  });
  return data;
};

export const createBook = async (payload: Partial<Book>) => {
  const { data } = await api.post("/v1/books", payload);
  return data;
};

export const updateBook = async (id: number | string, payload: Partial<Book>) => {
  const { data } = await api.put(`/v1/books/${id}`, payload);
  return data;
};

export const deleteBook = async (id: number | string) => {
  const { data } = await api.delete(`/v1/books/${id}`);
  return data;
};
