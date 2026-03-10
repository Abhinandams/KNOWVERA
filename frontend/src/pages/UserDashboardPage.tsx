import { useEffect, useMemo, useState } from "react";
import ActivityList from "../components/molecules/ActivityList/ActivityList";
import { getIssues, type Issue } from "../api/issueApi";
import { getReservations, type Reservation } from "../api/reservationApi";

const statCards = [
  { title: "Total Books", value: "1,248" },
  { title: "Books Issued", value: "42" },
  { title: "Reserved", value: "15" },
  { title: "Pending Fines", value: "$12.50" },
];

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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentActivity = async (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    try {
      const [issuesData, reservationsData] = await Promise.all([
        getIssues(),
        getReservations(),
      ]);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setError(null);
    } catch {
      setError("Failed to load recent activity.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivity(true);
    const intervalId = window.setInterval(() => {
      loadRecentActivity(false);
    }, 30000);
    return () => window.clearInterval(intervalId);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-900">Welcome back, Alexander</h2>
        <p className="mt-1 text-sm text-gray-500">Here is what&apos;s happening with your library account today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-500">{card.title}</p>
          </div>
        ))}
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
