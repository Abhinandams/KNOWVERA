import Table from "../components/organisms/Table/Table";
import Badge from "../components/atoms/Badge/Badge";
import { useEffect, useMemo, useState } from "react";
import { getAdminFines, type Fine as ApiFine } from "../api/fineApi";
import { extractApiErrorMessage } from "../utils/apiError";

type Fine = {
  fineId: number;
  id: string;
  patron: string;
  book: string;
  amount: number;
  date: string;
  method: string;
  status: "Collected" | "Pending";
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toUiFine = (fine: ApiFine): Fine => {
  const status = String(fine.fineStatus ?? "pending").toLowerCase() === "paid" ? "Collected" : "Pending";
  return {
    fineId: Number(fine.fineId),
    id: `F${String(fine.fineId).padStart(3, "0")}`,
    patron: `${fine.issue?.user?.fname ?? ""} ${fine.issue?.user?.lname ?? ""}`.trim() || "Unknown Patron",
    book: fine.issue?.book?.title ?? "Unknown Book",
    amount: toNumber(fine.remainingFineAmount),
    date: fine.issue?.issueDate ? new Date(fine.issue.issueDate).toLocaleDateString() : "-",
    method: status === "Collected" ? "Paid" : "-",
    status,
  };
};

const FineDetailsPage = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Collected" | "Pending">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const finesData = await getAdminFines();
      setFines((Array.isArray(finesData) ? finesData : []).map(toUiFine));
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to load fines."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const filteredFines = useMemo(() => {
    if (statusFilter === "All") return fines;
    return fines.filter((fine) => fine.status === statusFilter);
  }, [fines, statusFilter]);

  const fineColumns = [
    { key: "patron", header: "Library Patron", accessor: "patron" as const },
    { key: "book", header: "Book Details", accessor: "book" as const },
    {
      key: "amount",
      header: "Fine Amount",
      render: (fine: Fine) => <span>${fine.amount.toFixed(2)}</span>,
    },
    { key: "date", header: "Date Logged", accessor: "date" as const },
    { key: "method", header: "Method", accessor: "method" as const },
    {
      key: "status",
      header: "Status",
      render: (fine: Fine) => (
        <Badge
          text={fine.status}
          variant={fine.status === "Pending" ? "danger" : "success"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Ledger */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 pl-4">

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Financial Ledger</h3>
            <p className="text-sm text-gray-500">
              Detailed history of fine assessments and payments.
            </p>
          </div>

          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | "Collected" | "Pending")}
          >
            <option value="All">All Records</option>
            <option value="Collected">Collected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading fines...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && <Table columns={fineColumns} data={filteredFines} rowKey={(fine) => fine.id} />}
      </div>

    </div>
  );
};

export default FineDetailsPage;
