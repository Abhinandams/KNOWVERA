import { useEffect, useMemo, useState } from "react";
import Input from "../components/atoms/Input/Input";
import Pagination from "../components/organisms/Pagination/Pagination";
import Table from "../components/organisms/Table/Table";
import Badge from "../components/atoms/Badge/Badge";
import type { TableColumn } from "../components/organisms/Table/Table";
import { getReservations, type Reservation as ApiReservation } from "../api/reservationApi";
import { extractApiErrorMessage } from "../utils/apiError";

type ReservationStatus = "Reserved" | "Collected" | "Cancelled";

type Reservation = {
  id: string;
  memberName: string;
  memberEmail: string;
  bookTitle: string;
  bookIsbn: string;
  reservedOn: string;
  pickupBy: string;
  status: ReservationStatus;
};

const statusToVariant: Record<ReservationStatus, "success" | "neutral" | "danger"> = {
  Reserved: "neutral",
  Collected: "success",
  Cancelled: "danger",
};

const toUiReservation = (reservation: ApiReservation): Reservation => {
  const normalizedStatus = String(reservation.status ?? "reserved").toLowerCase();
  const status: ReservationStatus =
    normalizedStatus === "collected"
      ? "Collected"
      : normalizedStatus === "cancelled"
        ? "Cancelled"
        : "Reserved";
  return {
    id: String(reservation.reservationId),
    memberName: `${reservation.user?.fname ?? ""} ${reservation.user?.lname ?? ""}`.trim() || "Unknown Member",
    memberEmail: reservation.user?.email ?? "-",
    bookTitle: reservation.book?.title ?? "Unknown Book",
    bookIsbn: reservation.book?.isbn ?? "-",
    reservedOn: reservation.reservedOn ? new Date(reservation.reservedOn).toLocaleDateString() : "-",
    pickupBy: reservation.expiryDate ? new Date(reservation.expiryDate).toLocaleDateString() : "-",
    status,
  };
};

const columns: TableColumn<Reservation>[] = [
  {
    key: "member",
    header: "Member Details",
    render: (reservation) => (
      <div>
        <div className="font-medium text-gray-900">{reservation.memberName}</div>
        <div className="text-xs text-gray-500">{reservation.id}</div>
      </div>
    ),
  },
  {
    key: "book",
    header: "Book Details",
    render: (reservation) => (
      <div>
        <div className="text-gray-900">{reservation.bookTitle}</div>
        <div className="text-xs text-gray-500">ISBN: {reservation.bookIsbn}</div>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contact",
    render: (reservation) => <span className="text-gray-700">{reservation.memberEmail}</span>,
  },
  { key: "reservedOn", header: "Reserved On", accessor: "reservedOn" },
  { key: "pickupBy", header: "Pickup By", accessor: "pickupBy" },
  {
    key: "status",
    header: "Status",
    render: (reservation) => (
      <Badge text={reservation.status} variant={statusToVariant[reservation.status]} />
    ),
  },
];

const ReservationsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReservations();
        setReservations((Array.isArray(data) ? data : []).map(toUiReservation));
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load reservations."));
      } finally {
        setLoading(false);
      }
    };
    loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return reservations;
    return reservations.filter((reservation) =>
      [reservation.memberName, reservation.memberEmail, reservation.id]
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [reservations, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / pageSize));
  const pagedReservations = filteredReservations.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

 
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or reservation ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Reservation Queue</h3>
            <p className="text-sm text-gray-500">Manage active and pending reservation requests.</p>
          </div>
          <Badge text={`Total: ${filteredReservations.length} Reservations`} variant="neutral" />
        </div>

        {loading && <p className="text-sm text-gray-500">Loading reservations...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <Table columns={columns} data={pagedReservations} rowKey={(reservation) => reservation.id} tableClassName="shadow-none" />
        )}
      </div>

      {!loading && !error && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

    </div>
  );
};

export default ReservationsPage;
