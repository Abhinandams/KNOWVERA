export type ActionModalType =
  | "book_added"
  | "user_added"
  | "book_issued"
  | "book_returned"
  | "fine_collected"
  | "book_deleted"
  | "book_updated"
  | "book_reserved"
  | "reservation_hold"
  | "reservation_queue"
  | "reservation_cancelled"
  | "user_updated";

type ModalContent = {
  title: string;
  description: string;
};

const modalContent: Record<ActionModalType, ModalContent> = {
  book_added: {
    title: "Book Added Successfully",
    description: "The new book has been added to your catalog.",
  },
  user_added: {
    title: "User Added Successfully",
    description: "The new member has been registered in the system.",
  },
  book_issued: {
    title: "Book Issued Successfully",
    description: "The book has been issued and transaction is recorded.",
  },
  book_returned: {
    title: "Book Returned Successfully",
    description: "The return has been completed and inventory is updated.",
  },
  fine_collected: {
    title: "Fine Collected Successfully",
    description: "Fine payment has been collected and saved to ledger.",
  },
  book_deleted: {
    title: "Book Deleted Successfully",
    description: "The book has been deleted from your catalog.",
  },
  book_updated: {
    title: "Book Updated Successfully",
    description: "Book details were updated in your catalog.",
  },
  book_reserved: {
    title: "Book Reserved Successfully",
    description: "This title has been reserved for your account.",
  },
  reservation_hold: {
    title: "Reservation Confirmed",
    description: "Issue this book within 24 hours to keep the reservation active.",
  },
  reservation_queue: {
    title: "Added to Queue",
    description: "This book is currently unavailable. You are now in the queue.",
  },
  reservation_cancelled: {
    title: "Reservation Cancelled",
    description: "The reservation has been cancelled successfully.",
  },
  user_updated: {
    title: "User Updated Successfully",
    description: "Member profile details were updated.",
  },
};

type Props = {
  isOpen: boolean;
  type: ActionModalType | null;
  onClose: () => void;
};

const ActionModal = ({ isOpen, type, onClose }: Props) => {
  if (!isOpen || !type) return null;

  const content = modalContent[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
    >
      <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
          ✓
        </div>

        <h3 id="action-modal-title" className="text-lg font-semibold text-gray-900">
          {content.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{content.description}</p>

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

export default ActionModal;
