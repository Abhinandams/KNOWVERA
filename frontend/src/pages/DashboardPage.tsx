import { useEffect, useMemo, useState } from "react";
import SummaryCard from "../components/molecules/Cards/SummaryCard/SummaryCard";

import ActivityList from "../components/molecules/ActivityList/ActivityList";
import { getIssues, type Issue } from "../api/issueApi";
import { getReservations, type Reservation } from "../api/reservationApi";
import { getAllBooks } from "../api/bookApi";
import { getAdminUsers } from "../api/userApi";
import { getAdminFines, type Fine } from "../api/fineApi";
import { getAdminActivities } from "../utils/adminActivity";

type Activity = {
  title: string;
  subtitle: string;
  status: string;
  time: string;
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
      ? `Returned by ${issue.user?.fname ?? ""} ${issue.user?.lname ?? ""}`.trim()
      : `Issued to ${issue.user?.fname ?? ""} ${issue.user?.lname ?? ""}`.trim(),
  time: toRelativeTime(issue.returnDate ?? issue.issueDate),
  status: "Success",
});

const mapReservationToActivity = (reservation: Reservation): Activity => ({
  title: reservation.book?.title ?? "Reservation",
  subtitle:
    `Reserved by ${reservation.user?.fname ?? ""} ${reservation.user?.lname ?? ""}`.trim(),
  time: toRelativeTime(reservation.reservedOn),
  status: String(reservation.status ?? "").toLowerCase() === "cancelled" ? "Cancelled" : "Success",
});

const mapAdminActionToActivity = (activity: {
  title: string;
  subtitle: string;
  status: string;
  timestamp: string;
}): Activity => ({
  title: activity.title,
  subtitle: activity.subtitle,
  time: toRelativeTime(activity.timestamp),
  status: activity.status,
});

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const DashboardPage = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [availableNow, setAvailableNow] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingFines, setPendingFines] = useState(0);
  const [totalReservation, setTotalReservation] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const loadDashboardData = async (showLoader: boolean) => {
    if (showLoader) {
      setLoadingActivities(true);
      setLoadingStats(true);
    }
    try {
      const [issuesData, reservationsData, booksData, usersData, finesData] = await Promise.all([
        getIssues(),
        getReservations(),
        getAllBooks(),
        getAdminUsers({ page: 0, size: 1, sort: "fname" }),
        getAdminFines(),
      ]);

      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setActivityError(null);

      const books = Array.isArray(booksData) ? booksData : [];
      const usersTotal = Number(usersData?.totalElements ?? 0);
      const fines = (Array.isArray(finesData) ? finesData : []) as Fine[];

      const available = books.reduce(
        (sum, book) => sum + toNumber(book.availableCopies ?? book.available_copies),
        0
      );
      const pendingFineAmount = fines
        .filter((fine) => String(fine.fineStatus ?? "").toLowerCase() !== "paid")
        .reduce((sum, fine) => sum + toNumber(fine.remainingFineAmount), 0);

      setTotalBooks(books.length);
      setAvailableNow(available);
      setTotalUsers(usersTotal);
      setPendingFines(pendingFineAmount);
      setTotalReservation(Array.isArray(reservationsData) ? reservationsData.length : 0);
      setStatsError(null);
    } catch {
      setActivityError("Failed to load recent activity.");
      setStatsError("Failed to load dashboard stats.");
    } finally {
      if (showLoader) {
        setLoadingActivities(false);
        setLoadingStats(false);
      }
    }
  };

  useEffect(() => {
    loadDashboardData(true);
    const intervalId = window.setInterval(() => {
      loadDashboardData(false);
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
    const fromAdminActions = getAdminActivities(20).map((activity) => ({
      ts: new Date(activity.timestamp).getTime(),
      activity: mapAdminActionToActivity(activity),
    }));

    return [...fromIssues, ...fromReservations, ...fromAdminActions]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8)
      .map((item) => item.activity);
  }, [issues, reservations]);

  const statCards = [
    { title: "Total Books", value: totalBooks.toLocaleString(), color: "purple" as const },
    { title: "Available Now", value: availableNow.toLocaleString(), color: "green" as const },
    { title: "Total Users", value: totalUsers.toLocaleString(), color: "yellow" as const },
    { title: "Pending Fines", value: `$${pendingFines.toFixed(2)}`, color: "blue" as const },
    { title: "Total Reservation", value: totalReservation.toLocaleString(), color: "red" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, Admin</h2>
          <p className="text-gray-500 text-sm">
            Here's what's happening in your library today.
          </p>
        </div>

        {/* Stats Cards */}
        {loadingStats && <p className="text-sm text-gray-500">Loading dashboard stats...</p>}
        {statsError && <p className="text-sm text-red-600">{statsError}</p>}
        {!loadingStats && !statsError && (
          <div className="dashboard-stat-grid">
            {statCards.map((card) => (
              <SummaryCard key={card.title} title={card.title} value={card.value} color={card.color}/>
            ))}
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6">

          {/* Recent Activity */}
          <div className="bg-white p-2 rounded-xl shadow-sm">
            {loadingActivities && <p className="text-sm text-gray-500">Loading recent activity...</p>}
            {activityError && <p className="text-sm text-red-600">{activityError}</p>}
            {!loadingActivities && !activityError && activities.length > 0 && (
              <ActivityList
                title="Recent Activity"
                activities={activities}
              />
            )}
            {!loadingActivities && !activityError && activities.length === 0 && (
              <p className="text-sm text-gray-500">No recent activity found.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
