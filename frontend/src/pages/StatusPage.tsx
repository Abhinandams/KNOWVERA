import { useEffect, useState } from "react";
import Card from "../components/molecules/Cards/Card/Card";
import Button from "../components/atoms/Button/Button";
import Badge from "../components/atoms/Badge/Badge";
import Table from "../components/organisms/Table/Table";
import type { TableColumn } from "../components/organisms/Table/Table";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import type { ActionModalType } from "../components/organisms/ActionModal/ActionModal";
import { getReservations, updateReservationStatus } from "../api/reservationApi";
import { getIssues } from "../api/issueApi";
import { extractApiErrorMessage } from "../utils/apiError";

type StatusRow = {
  reservationId?: number;
  title: string;
  issueDate: string;
  returnDate: string;
  status: React.ReactNode;
  fine: string;
  action?: React.ReactNode;
};

const columns: TableColumn<StatusRow>[] = [
  { key: "title", header: "Book Title", accessor: "title" as const },
  { key: "issueDate", header: "Issue Date", accessor: "issueDate" as const },
  { key: "returnDate", header: "Return Date", accessor: "returnDate" as const },
  { key: "status", header: "Status", accessor: "status" as const },
  { key: "fine", header: "Fine", accessor: "fine" as const },
  { key: "action", header: "Action", accessor: "action" as const },
];

const StatusPage = () => {
  const [activeTab, setActiveTab] = useState("issued");
  const [actionModalType, setActionModalType] = useState<ActionModalType | null>(null);
  const [issuedBooks, setIssuedBooks] = useState<StatusRow[]>([]);
  const [fineBooks, setFineBooks] = useState<StatusRow[]>([]);
  const [loadingIssued, setLoadingIssued] = useState(false);
  const [errorIssued, setErrorIssued] = useState<string | null>(null);
  const [reservedBooks, setReservedBooks] = useState<StatusRow[]>([]);
  const [loadingReserved, setLoadingReserved] = useState(false);
  const [errorReserved, setErrorReserved] = useState<string | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      setLoadingIssued(true);
      setErrorIssued(null);
      try {
        const data = await getIssues();
        const issues = Array.isArray(data) ? data : [];

        const issuedRows: StatusRow[] = issues
          .filter((issue) => {
            const status = String(issue.status ?? "").toLowerCase();
            return status === "issued" || status === "overdue";
          })
          .map((issue) => {
            const normalizedStatus = String(issue.status ?? "").toLowerCase();
            const isOverdue = normalizedStatus === "overdue";
            return {
              title: issue.book?.title ?? "Unknown Book",
              issueDate: issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : "-",
              returnDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-",
              status: <Badge text={isOverdue ? "Overdue" : "Active"} variant={isOverdue ? "danger" : "success"} />,
              fine: "-",
            };
          });

        const fineRows: StatusRow[] = issues
          .filter((issue) => String(issue.status ?? "").toLowerCase() === "overdue")
          .map((issue) => ({
            title: issue.book?.title ?? "Unknown Book",
            issueDate: issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : "-",
            returnDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-",
            status: <Badge text="Overdue" variant="danger" />,
            fine: "Pending",
            action: <Button variant="danger">Pay Fine</Button>,
          }));

        setIssuedBooks(issuedRows);
        setFineBooks(fineRows);
      } catch (err) {
        setErrorIssued(extractApiErrorMessage(err, "Failed to load issued books."));
      } finally {
        setLoadingIssued(false);
      }
    };

    const loadReservations = async () => {
      setLoadingReserved(true);
      setErrorReserved(null);
      try {
        const data = await getReservations();
        const rows: StatusRow[] = (Array.isArray(data) ? data : [])
          .filter((reservation) => String(reservation.status ?? "").toLowerCase() === "reserved")
          .map((reservation) => ({
            reservationId: reservation.reservationId,
            title: reservation.book?.title ?? "Unknown Book",
            issueDate: reservation.reservedOn ? new Date(reservation.reservedOn).toLocaleDateString() : "-",
            returnDate: reservation.expiryDate ? new Date(reservation.expiryDate).toLocaleDateString() : "-",
            status: <Badge text="Reserved" variant="success" />,
            fine: "-",
            action: (
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await updateReservationStatus(Number(reservation.reservationId), "cancel");
                    setReservedBooks((prev) =>
                      prev.filter((item) => item.reservationId !== reservation.reservationId)
                    );
                    setActionModalType("reservation_cancelled");
                  } catch (err) {
                    setErrorReserved(extractApiErrorMessage(err, "Failed to cancel reservation."));
                  }
                }}
              >
                Cancel
              </Button>
            ),
          }));
        setReservedBooks(rows);
      } catch (err) {
        setErrorReserved(extractApiErrorMessage(err, "Failed to load reservations."));
      } finally {
        setLoadingReserved(false);
      }
    };

    loadIssues();
    loadReservations();
    const intervalId = window.setInterval(() => {
      loadIssues();
      loadReservations();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  let tableData = issuedBooks;

  if (activeTab === "reserved") tableData = reservedBooks;
  if (activeTab === "fine") tableData = fineBooks;

  const visibleColumns =
    activeTab === "issued" ? columns.filter((column) => column.key !== "action") : columns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Track Your Books</h2>
          <p className="text-sm text-gray-500">
            Manage issued, reserved, and overdue items in one place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === "issued" ? "primary" : "ghost"}
          onClick={() => setActiveTab("issued")}
        >
          Issued
        </Button>

        <Button
          variant={activeTab === "reserved" ? "primary" : "ghost"}
          onClick={() => setActiveTab("reserved")}
        >
          Reserved
        </Button>

        <Button
          variant={activeTab === "fine" ? "primary" : "ghost"}
          onClick={() => setActiveTab("fine")}
        >
          With Fine
        </Button>
      </div>

      {/* Table */}
      <Card>
        {activeTab === "issued" && loadingIssued && <p className="text-sm text-gray-500">Loading issued books...</p>}
        {activeTab === "issued" && errorIssued && <p className="text-sm text-red-600">{errorIssued}</p>}
        {activeTab === "reserved" && loadingReserved && <p className="text-sm text-gray-500">Loading reservations...</p>}
        {activeTab === "reserved" && errorReserved && <p className="text-sm text-red-600">{errorReserved}</p>}
        {activeTab === "fine" && loadingIssued && <p className="text-sm text-gray-500">Loading fines...</p>}
        {activeTab === "fine" && errorIssued && <p className="text-sm text-red-600">{errorIssued}</p>}
        <Table columns={visibleColumns} data={tableData} />
      </Card>

      {/* Reservation info */}
      <Card title="Reservation Pickup">
        <p className="text-sm text-gray-500">
          Once a book is ready, you have 24 hours to collect it before the reservation expires.
        </p>
      </Card>

      <ActionModal
        isOpen={actionModalType !== null}
        type={actionModalType}
        onClose={() => setActionModalType(null)}
      />
    </div>
  );
};

export default StatusPage;
