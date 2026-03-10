import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/atoms/Input/Input";
import Button from "../components/atoms/Button/Button";
import Badge from "../components/atoms/Badge/Badge";
import { getAllBooks, type Book } from "../api/bookApi";
import type { UserBook } from "../types/book";
import Pagination from "../components/organisms/Pagination/Pagination";
import { extractApiErrorMessage } from "../utils/apiError";
import { getCategoryCover } from "../utils/bookCover";

const toUiBook = (b: Book): UserBook => {
  const category = String(
    b.category ?? (Array.isArray(b.categories) ? b.categories[0] : undefined) ?? "General"
  );
  return {
  id: Number(b.id ?? b.bookId ?? 0),
  title: String(b.title ?? "Untitled"),
  author: String(b.author ?? (Array.isArray(b.authors) ? b.authors[0] : undefined) ?? "Unknown Author"),
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

const UserBooksPage = () => {
  const navigate = useNavigate();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [availabilityFilter, setAvailabilityFilter] = useState("All Books");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 12;

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawBooks: Book[] = await getAllBooks();
        setUserBooks(rawBooks.map(toUiBook));
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load books."));
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(userBooks.map((book) => book.category))).sort((a, b) => a.localeCompare(b)),
    [userBooks]
  );

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return userBooks.filter((book) => {
      const matchesSearch =
        keyword.length === 0 ||
        [book.title, book.author, book.publisher].some((value) =>
          value.toLowerCase().includes(keyword)
        );
      const matchesCategory =
        categoryFilter === "All Categories" || book.category === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "All Books" ||
        (availabilityFilter === "Available" ? book.status === "Available" : book.status === "Unavailable");
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [userBooks, search, categoryFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const pagedBooks = filteredBooks.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [search, categoryFilter, availabilityFilter]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(0);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-900">Browse Books</h2>
        <p className="mt-1 text-sm text-gray-500">Search and filter titles in the catalog.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Input
              placeholder="Search by title, author, or publisher..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-700 lg:col-span-2"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option>All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-700 lg:col-span-2"
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
          >
            <option>All Books</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            className="border-violet-200 text-violet-700 hover:bg-violet-50 lg:col-span-2"
            onClick={() => {
              setSearch("");
              setCategoryFilter("All Categories");
              setAvailabilityFilter("All Books");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <p className="text-right text-sm text-gray-500">
        Showing {filteredBooks.length} items • Page {filteredBooks.length === 0 ? 0 : page + 1} of{" "}
        {filteredBooks.length === 0 ? 0 : totalPages}
      </p>

      {loading && <p className="text-sm text-gray-500">Loading books...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {pagedBooks.map((book) => (
          <div key={book.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative">
              <img src={book.image} alt={book.title} className="h-72 w-full object-cover" />
              <div className="absolute right-3 top-3">
                <Badge text={book.status} variant={book.status === "Available" ? "success" : "danger"} />
              </div>
            </div>

            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">{book.publisher}</p>
              <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-500">{book.author}</p>

              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                onClick={() => navigate(`/user/books/${book.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>}
      {!loading && !error && filteredBooks.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default UserBooksPage;
