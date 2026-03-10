import { Link } from "react-router-dom"
import Badge from "../../../atoms/Badge/Badge"

type Props = {
  id: number
  title: string
  author: string
  category: string
  publisher: string
  image: string
  availableCopies: number
}

const BookCard = ({
  id,
  title,
  author,
  category,
  publisher,
  image,
  availableCopies
}: Props) => {
  const isAvailable = availableCopies > 0

  return (
    <Link
      to={`/admin/books/${id}`}
      className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      <img src={image} alt={title} className="h-40 w-full object-cover md:h-56" />

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Badge text={category} variant="category" />
          <Badge text={isAvailable ? "Available" : "Unavailable"} variant={isAvailable ? "success" : "danger"} />
        </div>

        <div className="space-y-1">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{author}</p>
          <p className="text-sm text-gray-500">{publisher}</p>
        </div>

        <p className="text-sm font-medium text-gray-700">Copies: {availableCopies}</p>
      </div>
    </Link>
  )
}

export default BookCard
