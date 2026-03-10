import { getAllBooks } from "../api/bookApi"
import BookFilters from "../components/organisms/BookFilters/BookFilters"
import BookGrid from "../components/organisms/BookGrid/BookGrid"
import Pagination from "../components/organisms/Pagination/Pagination"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/atoms/Button/Button"
import { extractApiErrorMessage } from "../utils/apiError"
import { getCategoryCover } from "../utils/bookCover"

type UiBook = {
  id: number
  title: string
  author: string
  category: string
  publisher: string
  image: string
  availableCopies: number
}

const BooksPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [books, setBooks] = useState<UiBook[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Genres")
  const [availabilityFilter, setAvailabilityFilter] = useState("All Books")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 12

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true)
      setError(null)

      try {
        const allRawBooks = (await getAllBooks()) as unknown[] as Record<string, unknown>[]

        const mappedBooks: UiBook[] = allRawBooks.map((book) => {
          const authors = Array.isArray(book.authors) ? (book.authors as unknown[]).map(String) : []
          const categories = Array.isArray(book.categories) ? (book.categories as unknown[]).map(String) : []
          const category = String(book.category ?? categories[0] ?? "General")
          return {
          id: Number(book.id ?? book.bookId ?? 0),
          title: String(book.title ?? "Untitled"),
          author: String(book.author ?? authors[0] ?? "Unknown Author"),
          category,
          publisher: String(book.publisher ?? "Unknown Publisher"),
          image: getCategoryCover(category),
          availableCopies: Number(book.availableCopies ?? book.available_copies ?? 0),
        }})

        setBooks(mappedBooks)
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load books. Please try again."))
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter((book) => {
      const matchesSearch =
        q.length === 0 ||
        [book.title, book.author, book.publisher].some((value) =>
          value.toLowerCase().includes(q)
        )
      const matchesCategory =
        categoryFilter === "All Genres" || book.category === categoryFilter
      const matchesAvailability =
        availabilityFilter === "All Books" ||
        (availabilityFilter === "Available" ? book.availableCopies > 0 : book.availableCopies <= 0)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [books, search, categoryFilter, availabilityFilter])

  const categories = useMemo(
    () => Array.from(new Set(books.map((book) => book.category))).sort((a, b) => a.localeCompare(b)),
    [books]
  )

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize))
  const pagedBooks = filteredBooks.slice(page * pageSize, (page + 1) * pageSize)

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(0)
    }
  }, [page, totalPages])

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Books</h2>
          <Button type="button" onClick={() => navigate("/admin/add-book")}>
            Add New Book
          </Button>
        </div>

        <BookFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(0)
          }}
          category={categoryFilter}
          onCategoryChange={(value) => {
            setCategoryFilter(value)
            setPage(0)
          }}
          availability={availabilityFilter}
          onAvailabilityChange={(value) => {
            setAvailabilityFilter(value)
            setPage(0)
          }}
          categories={categories}
        />

        {!loading && !error && (
          <p className="text-right text-sm text-gray-500">
            Showing {filteredBooks.length} items • Page {filteredBooks.length === 0 ? 0 : page + 1} of{" "}
            {filteredBooks.length === 0 ? 0 : totalPages}
          </p>
        )}

        {loading && <p className="text-sm text-gray-500">Loading books...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && <BookGrid books={pagedBooks} />}

        {!loading && !error && filteredBooks.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

      </div>
    </div>
  )
}

export default BooksPage
