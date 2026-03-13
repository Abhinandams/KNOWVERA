import Table from "../components/organisms/Table/Table";
import Badge from "../components/atoms/Badge/Badge";
import { useEffect, useMemo, useState } from "react";
import { getAdminFines, type Fine as ApiFine } from "../api/fineApi";
import { extractApiErrorMessage } from "../utils/apiError";
import Button from "../components/atoms/Button/Button";
import Input from "../components/atoms/Input/Input";
import { getAdminPayments, payFine, type PaymentSummary } from "../api/paymentApi";

type Fine = {
  fineId: number;
  id: string;
  patron: string;
  book: string;
  totalAmount: number;
  remainingAmount: number;
  date: string;
  status: "Collected" | "Pending";
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

type PaymentAgg = { paidSum: number };

const buildPaymentAggMap = (payments: PaymentSummary[]) => {
  const map = new Map<number, PaymentAgg>();
  for (const p of payments) {
    const fineId = Number(p.fineId ?? 0);
    if (!fineId) continue;
    const amount = toNumber(p.amountPaid);

    const existing = map.get(fineId) ?? { paidSum: 0 };
    map.set(fineId, { paidSum: existing.paidSum + (amount > 0 ? amount : 0) });
  }
  return map;
};

const toUiFine = (fine: ApiFine, paymentAggByFineId: Map<number, PaymentAgg>): Fine => {
  const status = String(fine.fineStatus ?? "pending").toLowerCase() === "paid" ? "Collected" : "Pending";
  const fineId = Number(fine.fineId);
  const agg = paymentAggByFineId.get(fineId);
  const paidSoFar = agg?.paidSum ?? 0;
  const remainingAmount = toNumber(fine.remainingFineAmount);
  const rawTotal = toNumber(fine.totalFineAmount);
  const inferredTotal = rawTotal > 0 ? rawTotal : remainingAmount + paidSoFar;
  const totalAmount = Math.max(inferredTotal, remainingAmount);
  return {
    fineId,
    id: `F${String(fineId).padStart(3, "0")}`,
    patron: `${fine.issue?.user?.fname ?? ""} ${fine.issue?.user?.lname ?? ""}`.trim() || "Unknown Patron",
    book: fine.issue?.book?.title ?? "Unknown Book",
    totalAmount,
    remainingAmount,
    date: fine.issue?.issueDate ? new Date(fine.issue.issueDate).toLocaleDateString() : "-",
    status,
  };
};

const FineDetailsPage = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Collected" | "Pending">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingFine, setPayingFine] = useState<Fine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gpay" | "card" | "upi">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [finesData, paymentsData] = await Promise.all([getAdminFines(), getAdminPayments()]);
      const paymentAggMap = buildPaymentAggMap(Array.isArray(paymentsData) ? paymentsData : []);
      setFines((Array.isArray(finesData) ? finesData : []).map((fine) => toUiFine(fine, paymentAggMap)));
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
      key: "totalAmount",
      header: "Fine Amount",
      render: (fine: Fine) => <span>${fine.totalAmount.toFixed(2)}</span>,
    },
    {
      key: "paidAmount",
      header: "Paid",
      render: (fine: Fine) => <span>${Math.max(0, fine.totalAmount - fine.remainingAmount).toFixed(2)}</span>,
    },
    {
      key: "remainingAmount",
      header: "Remaining Due",
      render: (fine: Fine) => <span>${fine.remainingAmount.toFixed(2)}</span>,
    },
    { key: "date", header: "Book Issued On", accessor: "date" as const },
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
    {
      key: "action",
      header: "Action",
      render: (fine: Fine) =>
        fine.status === "Pending" && fine.remainingAmount > 0 ? (
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setPayError(null);
              setPaymentMethod("cash");
              setAmountPaid(String(fine.remainingAmount || ""));
              setPayingFine(fine);
            }}
            className="whitespace-nowrap"
          >
            Collect
          </Button>
        ) : (
          <span className="text-sm text-gray-400">No Action</span>
        ),
    },
  ];

  const closePayModal = () => {
    setPayError(null);
    setPayingFine(null);
    setAmountPaid("");
    setPaymentMethod("cash");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 pl-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Financial Ledger</h3>
            <p className="text-sm text-gray-500">Detailed history of fine assessments and payments.</p>
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

      {payingFine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collect-fine-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !paying) closePayModal();
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="collect-fine-modal-title" className="text-lg font-semibold">
                  Collect Fine Payment
                </h3>
                <p className="text-sm text-gray-500">
                  {payingFine.patron} · {payingFine.book}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => {
                  if (!paying) closePayModal();
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Total Fine</div>
                <div className="text-base font-semibold">${payingFine.totalAmount.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Remaining Due</div>
                <div className="text-base font-semibold">${payingFine.remainingAmount.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Input
                label="Amount to Collect"
                type="number"
                min={0}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />

              <label className="block">
                <div className="mb-1 text-sm text-gray-600">Payment Method</div>
                <select
                  className="w-full rounded border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                >
                  <option value="cash">Cash</option>
                  <option value="gpay">GPay</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </label>

              {payError && <p className="text-sm text-red-600">{payError}</p>}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (!paying) closePayModal();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={paying}
                onClick={async () => {
                  setPayError(null);
                  const amount = Number(amountPaid);
                  if (!Number.isFinite(amount) || amount <= 0) {
                    setPayError("Enter a valid amount.");
                    return;
                  }
                  if (amount > payingFine.remainingAmount) {
                    setPayError("Amount cannot exceed remaining due.");
                    return;
                  }

                  setPaying(true);
                  try {
                    await payFine({
                      fineId: payingFine.fineId,
                      amountPaid: amount,
                      paymentMethod,
                    });
                    closePayModal();
                    await loadFinancialData();
                  } catch (err) {
                    setPayError(extractApiErrorMessage(err, "Failed to collect fine."));
                  } finally {
                    setPaying(false);
                  }
                }}
                className="w-full sm:w-auto"
              >
                {paying ? "Collecting..." : "Collect Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineDetailsPage;
