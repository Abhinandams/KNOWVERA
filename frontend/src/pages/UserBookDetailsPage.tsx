import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/atoms/Button/Button";
import BookDetailsContent from "../components/organisms/BookDetails/BookDetailsContent";
import ActionModal, { type ActionModalType } from "../components/organisms/ActionModal/ActionModal";
import { createReservation } from "../api/reservationApi";
import { getBookById, type Book } from "../api/bookApi";
import type { UserBook } from "../types/book";
import { extractApiErrorMessage } from "../utils/apiError";
import ErrorModal from "../components/organisms/ErrorModal/ErrorModal";
import { getCategoryCover } from "../utils/bookCover";

const mapBookToUi = (b: Book): UserBook => {
  const category = String(b.category ?? (Array.isArray(b.categories) ? b.categories[0] : undefined) ?? "General");
  const authorName =
    b.author ?? (Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.join(", ") : "Unknown Author");
  return {
  id: Number(b.id ?? b.bookId ?? 0),
  title: String(b.title ?? "Untitled"),
  author: String(authorName),
  category,
  publisher: String(b.publisher ?? "Unknown Publisher"),
  image: getCategoryCover(category),
  status: Number(b.availableCopies ?? b.available_copies ?? 0) > 0 ? "Available" : "Unavailable",
  totalCopies: Number(b.totalCopies ?? b.total_copies ?? 1),
  availableCopies: Number(b.availableCopies ?? b.available_copies ?? 0),
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
  const [reserveModalType, setReserveModalType] = useState<ActionModalType | null>(null);
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
          <Button type="button" className="mt-4" onClick={() => navigate("/user/books")}>
            Back to Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BookDetailsContent
        book={book}
        onBack={() => navigate("/user/books")}
        backLabel="Books"
        showTotalCopies={false}
        primaryActionLabel="Reserve This Book"
        onPrimaryAction={async () => {
          try {
            setActionError(null);
            const isAvailableNow = (book?.availableCopies ?? 0) > 0;
            await createReservation({ bookId });
            if (isAvailableNow) {
              setBook((prev) =>
                prev ? { ...prev, availableCopies: Math.max(0, (prev.availableCopies ?? 0) - 1) } : prev
              );
            }
            setReserveModalType(isAvailableNow ? "reservation_hold" : "reservation_queue");
          } catch (err) {
            setActionError(extractApiErrorMessage(err, "Failed to reserve this book."));
          }
        }}
        primaryActionClassName="bg-emerald-600 hover:bg-emerald-700"
      />
      <ActionModal
        isOpen={reserveModalType !== null}
        type={reserveModalType}
        onClose={() => setReserveModalType(null)}
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
