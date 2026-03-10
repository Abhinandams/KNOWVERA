import Form from "../components/organisms/BookForm/Form";
import Input from "../components/atoms/Input/Input";
import { useState } from "react";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import { createBook } from "../api/bookApi";
import { extractApiErrorMessage } from "../utils/apiError";
import { logAdminActivity } from "../utils/adminActivity";
import Button from "../components/atoms/Button/Button";
import { useNavigate } from "react-router-dom";

const AddBookPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    totalCopies: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const totalCopies = Number(form.totalCopies || 0);
      const submittedTitle = form.title.trim() || "Untitled";
      await createBook({
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        publisher: form.publisher,
        totalCopies,
        availableCopies: totalCopies,
      });
      logAdminActivity({
        title: submittedTitle,
        subtitle: "Book added by Admin",
      });
      setIsModalOpen(true);
      setForm({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        totalCopies: "",
      });
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to add book."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="hover:text-emerald-700"
          >
            Books
          </button>
          <span className="mx-2 text-gray-400">›</span>
          <span className="font-medium text-gray-700">Add Book</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Book Details</h2>
            <p className="text-gray-500 text-sm">
              Enter information to add a new title.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => navigate("/admin/books")}
          >
            Back to Books
          </Button>
        </div>
      </div>

      {/* Form container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
              <Form submitLabel={loading ? "Saving..." : "Save Book"} onSubmit={handleSubmit} showUpload={false}>
                {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

                <div className="col-span-2">
                <label>Book Title</label>
                <Input
                  placeholder="Book title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                </div>

                <div>
                <label>Author</label>
                <Input
                  value={form.author}
                  onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                />
                </div>
                 <div>
                <label>ISBN</label>
                <Input
                  value={form.isbn}
                  onChange={(event) => setForm((prev) => ({ ...prev, isbn: event.target.value }))}
                />
                </div>
                <div>
                <label>Publisher</label>
                <Input
                  value={form.publisher}
                  onChange={(event) => setForm((prev) => ({ ...prev, publisher: event.target.value }))}
                />
                </div>
                <div>
                <label>Totaol no of copies</label>
                <Input
                  type="number"
                  value={form.totalCopies}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalCopies: event.target.value }))}
                />
                </div>
               

        </Form>  
        </div>

      <ActionModal
        isOpen={isModalOpen}
        type="book_added"
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default AddBookPage;
