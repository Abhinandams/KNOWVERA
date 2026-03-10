import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookDetailsContent from "../components/organisms/BookDetails/BookDetailsContent";
import { deleteBook, getBookById, type Book, updateBook } from "../api/bookApi";
import BookUpdateModal from "../components/organisms/BookDetails/BookUpdateModal";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import type { ActionModalType } from "../components/organisms/ActionModal/ActionModal";
import type { UserBook } from "../types/book";
import { extractApiErrorMessage } from "../utils/apiError";
import { logAdminActivity } from "../utils/adminActivity";
import ErrorModal from "../components/organisms/ErrorModal/ErrorModal";
import { getCategoryCover } from "../utils/bookCover";

const mapBookToUi = (b: Book): UserBook => {
  const id = Number(b.id ?? b.bookId ?? 0);
  const available = Number(b.availableCopies ?? b.available_copies ?? 0);
  const authorName = b.author ?? (Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.join(", ") : "Unknown Author");
  const categoryName = b.category ?? (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : "General");

  return {
    id,
    title: String(b.title ?? "Untitled"),
    author: String(authorName),
    category: String(categoryName),
    publisher: String(b.publisher ?? "Unknown Publisher"),
    image: getCategoryCover(String(categoryName)),
    status: available > 0 ? "Available" : "Unavailable",
    totalCopies: Number(b.totalCopies ?? b.total_copies ?? Math.max(1, available)),
    availableCopies: available,
    isbn: String(b.isbn ?? "-"),
    firstPublished: String(b.firstPublished ?? b.first_published ?? "-"),
    language: String(b.language ?? "English"),
    edition: String(b.edition ?? "-"),
    synopsis: String(b.description ?? "No description available."),
  };
};

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<ActionModalType | null>(null);

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
        setLoadError(extractApiErrorMessage(err, "Failed to load book details."));
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">Loading book details...</p>;
  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;
  if (!book) return <p className="text-sm text-gray-500">Book not found.</p>;

  return (
    <div className="p-2">
      <BookDetailsContent
        book={book}
        onBack={() => navigate("/admin/books")}
        backLabel="Books"
        primaryActionLabel="Update Book"
        onPrimaryAction={() => setIsEditModalOpen(true)}
        primaryActionClassName="bg-emerald-600 hover:bg-emerald-700"
        secondaryActionLabel="Delete Book"
        secondaryActionVariant="danger"
        onSecondaryAction={async () => {
          if (!id) return;
          try {
            await deleteBook(id);
            logAdminActivity({
              title: book.title,
              subtitle: "Book deleted by Admin",
            });
            setActionModalType("book_deleted");
          } catch (err) {
            setActionError(extractApiErrorMessage(err, "Failed to delete book."));
          }
        }}
      />
      <BookUpdateModal
        isOpen={isEditModalOpen}
        book={book}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (updatedBook) => {
          if (!id) return;
          try {
            const totalCopies = Math.max(1, Number(updatedBook.totalCopies ?? 1));
            const requestedAvailable = Number(
              updatedBook.availableCopies ?? (updatedBook.status === "Available" ? totalCopies : 0)
            );
            const availableCopies = Math.min(totalCopies, Math.max(0, Number.isFinite(requestedAvailable) ? requestedAvailable : 0));
            const payload = {
              title: updatedBook.title,
              author: updatedBook.author,
              category: updatedBook.category,
              publisher: updatedBook.publisher,
              isbn: updatedBook.isbn,
              language: updatedBook.language,
              totalCopies,
              availableCopies,
              description: updatedBook.synopsis,
            };
            const saved = await updateBook(id, payload);
            setBook(mapBookToUi(saved));
            setIsEditModalOpen(false);
            setActionModalType("book_updated");
          } catch (err) {
            setActionError(extractApiErrorMessage(err, "Failed to update book."));
          }
        }}
      />
      <ActionModal
        isOpen={actionModalType !== null}
        type={actionModalType}
        onClose={() => {
          const wasDeleted = actionModalType === "book_deleted";
          setActionModalType(null);
          if (wasDeleted) {
            navigate("/admin/books");
          }
        }}
      />
      <ErrorModal
        isOpen={actionError !== null}
        message={actionError}
        onClose={() => setActionError(null)}
      />
    </div>
  );
};
export default BookDetailsPage;
