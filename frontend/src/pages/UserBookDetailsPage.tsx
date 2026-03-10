import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/atoms/Button/Button";
import BookDetailsContent from "../components/organisms/BookDetails/BookDetailsContent";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import { createReservation } from "../api/reservationApi";
import { getBookById, type Book } from "../api/bookApi";
import type { UserBook } from "../types/book";
import { extractApiErrorMessage } from "../utils/apiError";
import ErrorModal from "../components/organisms/ErrorModal/ErrorModal";
import { getCategoryCover } from "../utils/bookCover";

const mapBookToUi = (b: Book): UserBook => {
  const category = String(b.category ?? "General");
  return {
  id: Number(b.id ?? b.bookId ?? 0),
  title: String(b.title ?? "Untitled"),
  author: String(b.author ?? "Unknown Author"),
  category,
  publisher: String(b.publisher ?? "Unknown Publisher"),
  image: getCategoryCover(category),
  status: Number(b.availableCopies ?? b.available_copies ?? 0) > 0 ? "Available" : "Unavailable",
  totalCopies: Number(b.totalCopies ?? b.total_copies ?? 1),
  isbn: String(b.isbn ?? "-"),
  firstPublished: String(b.firstPublished ?? b.first_published ?? "-"),
  language: String(b.language ?? "English"),
  edition: String(b.edition ?? "-"),
  synopsis: String(b.description ?? "No synopsis available."),
  };
};

const UserBookDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const bookId = Number(id);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getBookById(id);
        setBook(mapBookToUi(data));
      } catch (err) {
        setLoadError(extractApiErrorMessage(err, "Failed to load book."));
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">Loading book details...</p>;
  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Book not found</h2>
          <p className="mt-2 text-sm text-gray-500">The selected book does not exist in the catalog.</p>
          <Button type="button" className="mt-4" onClick={() => navigate("/user/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BookDetailsContent
        book={book}
        onBack={() => navigate("/user/dashboard")}
        backLabel="Dashboard"
        primaryActionLabel="Reserve This Book"
        onPrimaryAction={async () => {
          try {
            setActionError(null);
            await createReservation({ bookId });
            setIsReserveModalOpen(true);
          } catch (err) {
            setActionError(extractApiErrorMessage(err, "Failed to reserve this book."));
          }
        }}
        primaryActionClassName="bg-emerald-600 hover:bg-emerald-700"
      />
      <ActionModal
        isOpen={isReserveModalOpen}
        type="book_reserved"
        onClose={() => setIsReserveModalOpen(false)}
      />
      <ErrorModal
        isOpen={actionError !== null}
        message={actionError}
        onClose={() => setActionError(null)}
      />
    </div>
  );
};

export default UserBookDetailsPage;
