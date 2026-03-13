import { useEffect, useMemo, useState } from "react";
import ActivityList from "../components/molecules/ActivityList/ActivityList";
import { getIssues, type Issue } from "../api/issueApi";
import { getReservations, type Reservation } from "../api/reservationApi";
import { getBooks } from "../api/bookApi";
import { getUserFines } from "../api/fineApi";
import { getAdminUserById } from "../api/userApi";
import { getAuthItem } from "../utils/authStorage";

type Stats = {
  totalBooks: number;
  booksIssued: number;
  reserved: number;
  pendingFines: number;
};

type Activity = {
  title: string;
  subtitle: string;
  time: string;
  status: string;
};

const toRelativeTime = (dateText?: string | null) => {
  if (!dateText) return "N/A";
  const timestamp = new Date(dateText).getTime();
  if (Number.isNaN(timestamp)) return "N/A";
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60)));
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
};

const mapIssueToActivity = (issue: Issue): Activity => ({
  title: issue.book?.title ?? "Book Transaction",
  subtitle:
    String(issue.status ?? "").toLowerCase() === "returned"
      ? "Book returned"
      : "Book issued",
  time: toRelativeTime(issue.returnDate ?? issue.issueDate),
  status: String(issue.status ?? "").toLowerCase() === "returned" ? "Success" : "Active",
});

const mapReservationToActivity = (reservation: Reservation): Activity => ({
  title: reservation.book?.title ?? "Reservation",
  subtitle: `Reservation ${String(reservation.status ?? "reserved").toLowerCase()}`,
  time: toRelativeTime(reservation.reservedOn),
  status: String(reservation.status ?? "").toLowerCase() === "cancelled" ? "Cancelled" : "Success",
});

const UserDashboardPage = () => {
  const [name, setName] = useState("User");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    booksIssued: 0,
    reserved: 0,
    pendingFines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    try {
      const userId = getAuthItem("userId");
      const [issuesData, reservationsData, booksPage, userFines] = await Promise.all([
        getIssues(),
        getReservations(),
        getBooks({ page: 0, size: 1 }),
        userId ? getUserFines(userId) : Promise.resolve([]),
      ]);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);

      const activeIssues = (Array.isArray(issuesData) ? issuesData : []).filter((issue) => {
        const status = String(issue.status ?? "").toLowerCase();
        return status === "issued" || status === "overdue";
      }).length;

      const activeReservations = (Array.isArray(reservationsData) ? reservationsData : []).filter((r) => {
        const status = String(r.status ?? "").toLowerCase();
        return status === "reserved";
      }).length;

      const pendingFineAmount = (Array.isArray(userFines) ? userFines : []).reduce((sum, fine) => {
        const status = String(fine.fineStatus ?? "pending").toLowerCase();
        const remaining = Number(fine.remainingFineAmount ?? 0);
        if (status === "paid") return sum;
        if (!Number.isFinite(remaining) || remaining <= 0) return sum;
        return sum + remaining;
      }, 0);

      setStats({
        totalBooks: Number(booksPage.totalElements ?? 0),
        booksIssued: activeIssues,
        reserved: activeReservations,
        pendingFines: pendingFineAmount,
      });
      setError(null);
    } catch {
      setError("Failed to load recent activity.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(true);
    const intervalId = window.setInterval(() => {
      loadDashboardData(false);
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadName = async () => {
      const userId = getAuthItem("userId");
      if (!userId) return;
      try {
        const user = await getAdminUserById(userId);
        const fullName = `${String(user.fname ?? "")} ${String(user.lname ?? "")}`.trim();
        setName(fullName || String(user.email ?? "User"));
      } catch {
        setName(getAuthItem("email") ?? "User");
      }
    };
    loadName();
  }, []);

  const activities = useMemo(() => {
    const fromIssues = issues.map((issue) => ({
      ts: new Date(issue.returnDate ?? issue.issueDate ?? 0).getTime(),
      activity: mapIssueToActivity(issue),
    }));
    const fromReservations = reservations.map((reservation) => ({
      ts: new Date(reservation.reservedOn ?? 0).getTime(),
      activity: mapReservationToActivity(reservation),
    }));
    return [...fromIssues, ...fromReservations]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8)
      .map((item) => item.activity);
  }, [issues, reservations]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-900">Welcome back, {name}</h2>
        <p className="mt-1 text-sm text-gray-500">Here is what&apos;s happening with your library account today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold text-gray-900">{numberFormatter.format(stats.totalBooks)}</p>
          <p className="mt-1 text-sm text-gray-500">Total Books</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold text-gray-900">{numberFormatter.format(stats.booksIssued)}</p>
          <p className="mt-1 text-sm text-gray-500">Books Issued</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold text-gray-900">{numberFormatter.format(stats.reserved)}</p>
          <p className="mt-1 text-sm text-gray-500">Reserved</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold text-gray-900">{currencyFormatter.format(stats.pendingFines)}</p>
          <p className="mt-1 text-sm text-gray-500">Pending Fines</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading recent activity...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && activities.length > 0 && (
        <ActivityList title="Recent Activity" activities={activities} />
      )}
      {!loading && !error && activities.length === 0 && (
        <p className="text-sm text-gray-500">No recent activity found.</p>
      )}
    </div>
  );
};

export default UserDashboardPage;
