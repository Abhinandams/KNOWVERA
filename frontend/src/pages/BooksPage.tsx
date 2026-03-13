import { searchBooks } from "../api/bookApi"
import { getCategories } from "../api/categoryApi"
import BookFilters from "../components/organisms/BookFilters/BookFilters"
import BookGrid from "../components/organisms/BookGrid/BookGrid"
import Pagination from "../components/organisms/Pagination/Pagination"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/atoms/Button/Button"
import { extractApiErrorMessage } from "../utils/apiError"
import { getCategoryCover } from "../utils/bookCover"
import { useDebouncedValue } from "../hooks/useDebouncedValue"

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
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const [categoryFilter, setCategoryFilter] = useState("All Genres")
  const [availabilityFilter, setAvailabilityFilter] = useState("All Books")
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 12

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategories(await getCategories())
      } catch {
        // Non-blocking; books can still load.
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await searchBooks({
          q: debouncedSearch.trim() || undefined,
          category: categoryFilter === "All Genres" ? undefined : categoryFilter,
          availability:
            availabilityFilter === "Available"
              ? "available"
              : availabilityFilter === "Unavailable"
                ? "unavailable"
                : undefined,
          page,
          size: pageSize,
          sort: "title",
        })

        const mapped: UiBook[] = (Array.isArray(res.content) ? res.content : []).map((book) => {
          const id = Number(book.bookId ?? book.id ?? 0)
          const authors = Array.isArray(book.authors)
            ? (book.authors as unknown[]).map(String)
            : book.author
              ? [String(book.author)]
              : []
          const categoriesArr = Array.isArray(book.categories)
            ? (book.categories as unknown[]).map(String)
            : book.category
              ? [String(book.category)]
              : []
          const category = String(book.category ?? categoriesArr[0] ?? "General")
          return {
            id,
            title: String(book.title ?? "Untitled"),
            author: String(authors[0] ?? "Unknown Author"),
            category,
            publisher: String(book.publisher ?? "Unknown Publisher"),
            image: getCategoryCover(category),
            availableCopies: Number(book.availableCopies ?? book.available_copies ?? 0),
          }
        })

        setBooks(mapped)
        setTotalPages(Math.max(1, Number(res.totalPages ?? 1)))
        setTotalElements(Number(res.totalElements ?? 0))
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load books. Please try again."))
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [page, pageSize, debouncedSearch, categoryFilter, availabilityFilter])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, categoryFilter, availabilityFilter])

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
            Showing {totalElements} items • Page {totalElements === 0 ? 0 : page + 1} of{" "}
            {totalElements === 0 ? 0 : totalPages}
          </p>
        )}

        {loading && <p className="text-sm text-gray-500">Loading books...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && <BookGrid books={books} />}

        {!loading && !error && totalElements > 0 && (
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
