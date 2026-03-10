import Badge from "../../atoms/Badge/Badge";
import Button from "../../atoms/Button/Button";
import type { UserBook } from "../../../types/book";
import ProfileInfoCard from "../../molecules/Cards/ProfileInfoCard/ProfileInfoCard";

type Props = {
  book: UserBook;
  onBack: () => void;
  backLabel: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionClassName?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionVariant?: "primary" | "ghost" | "danger";
  secondaryActionClassName?: string;
};

const BookDetailsContent = ({
  book,
  onBack,
  backLabel,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionClassName = "",
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionVariant = "danger",
  secondaryActionClassName = "",
}: Props) => {
  const metadata = [
    { label: "Book ID", value: String(book.id) },
    { label: "Total Copies", value: String(book.totalCopies ?? "-") },
    { label: "Available Copies", value: String(book.availableCopies ?? "-") },
    { label: "Publisher", value: book.publisher },
    { label: "ISBN-13", value: book.isbn },
    { label: "Language", value: book.language },
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        <button type="button" className="hover:text-violet-700" onClick={onBack}>
          {backLabel}
        </button>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <img src={book.image} alt={book.title} className="h-[560px] w-full rounded-xl object-cover" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge text={book.status} variant={book.status === "Available" ? "success" : "danger"} />
            <Badge text={book.category} variant="category" />
          </div>

          <div>
            <h2 className="text-5xl font-bold leading-tight text-gray-900">{book.title}</h2>
            <p className="mt-2 text-3xl text-gray-600">by {book.author}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {metadata.map((item) => (
              <ProfileInfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-xl font-semibold text-gray-900">Synopsis</h3>
            <p className="mt-3 text-lg leading-relaxed text-gray-600">{book.synopsis}</p>
          </div>

          {(primaryActionLabel || secondaryActionLabel) && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-3">
                {primaryActionLabel && (
                  <Button
                    type="button"
                    onClick={onPrimaryAction}
                    className={`rounded-full px-10 py-3 ${primaryActionClassName}`}
                  >
                    {primaryActionLabel}
                  </Button>
                )}
                {secondaryActionLabel && (
                  <Button
                    type="button"
                    variant={secondaryActionVariant}
                    onClick={onSecondaryAction}
                    className={`rounded-full px-10 py-3 ${secondaryActionClassName}`}
                  >
                    {secondaryActionLabel}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailsContent;
