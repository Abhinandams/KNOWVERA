type Props = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
  title?: string;
};

const ErrorModal = ({ isOpen, message, onClose, title = "Action Failed" }: Props) => {
  if (!isOpen || !message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
          !
        </div>

        <h3 id="error-modal-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-700">{message}</p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
