import { useEffect, useState } from "react";
import Button from "../../atoms/Button/Button";
import Input from "../../atoms/Input/Input";
import type { UserBook } from "../../../types/book";

type Props = {
  isOpen: boolean;
  book: UserBook | null;
  onClose: () => void;
  onSave: (updatedBook: UserBook) => void;
};

const BookUpdateModal = ({ isOpen, book, onClose, onSave }: Props) => {
  const [form, setForm] = useState<UserBook | null>(book);

  useEffect(() => {
    setForm(book);
  }, [book, isOpen]);

  if (!isOpen || !form) return null;

  const handleChange = <K extends keyof UserBook>(key: K, value: UserBook[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-update-modal-title"
    >
      <div className="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6 md:max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 id="book-update-modal-title" className="text-xl font-semibold text-gray-900">
            Update Book
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
          <Input
            label="Authors (comma separated)"
            value={form.author}
            onChange={(e) => handleChange("author", e.target.value)}
          />
          <Input label="Publisher" value={form.publisher} onChange={(e) => handleChange("publisher", e.target.value)} />
          <Input label="ISBN-13" value={form.isbn} onChange={(e) => handleChange("isbn", e.target.value)} />
          <Input
            label="Total Copies"
            type="number"
            value={form.totalCopies ?? 1}
            onChange={(e) => handleChange("totalCopies", Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            label="Available Copies"
            type="number"
            value={form.availableCopies ?? 0}
            onChange={(e) => handleChange("availableCopies", Math.max(0, Number(e.target.value) || 0))}
          />
          <Input label="Language" value={form.language} onChange={(e) => handleChange("language", e.target.value)} />
          <Input label="Category" value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
        </div>

        <label className="mt-4 block text-sm text-gray-600">
          Status
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value as UserBook["status"])}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </label>

        <label className="mt-4 block text-sm text-gray-600">
          Synopsis
          <textarea
            value={form.synopsis}
            onChange={(e) => handleChange("synopsis", e.target.value)}
            className="mt-1 h-28 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookUpdateModal;
