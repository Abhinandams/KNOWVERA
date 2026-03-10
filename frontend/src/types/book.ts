export type UserBookStatus = "Available" | "Unavailable";

export type UserBook = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  image: string;
  status: UserBookStatus;
  totalCopies?: number;
  availableCopies?: number;
  isbn: string;
  firstPublished: string;
  language: string;
  edition: string;
  category: string;
  synopsis: string;
};
