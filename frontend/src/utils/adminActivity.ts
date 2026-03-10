const ADMIN_ACTIVITY_KEY = "adminRecentActivities";
const MAX_STORED_ACTIVITIES = 100;

export type AdminActivityRecord = {
  title: string;
  subtitle: string;
  status: string;
  timestamp: string;
};

type LogAdminActivityInput = {
  title: string;
  subtitle: string;
  status?: string;
};

const readActivities = (): AdminActivityRecord[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AdminActivityRecord => {
      if (!item || typeof item !== "object") return false;
      const activity = item as Record<string, unknown>;
      return (
        typeof activity.title === "string" &&
        typeof activity.subtitle === "string" &&
        typeof activity.status === "string" &&
        typeof activity.timestamp === "string"
      );
    });
  } catch {
    return [];
  }
};

const writeActivities = (activities: AdminActivityRecord[]) => {
  try {
    localStorage.setItem(ADMIN_ACTIVITY_KEY, JSON.stringify(activities.slice(0, MAX_STORED_ACTIVITIES)));
  } catch {
  }
};

export const logAdminActivity = ({ title, subtitle, status = "Success" }: LogAdminActivityInput) => {
  const next: AdminActivityRecord = {
    title,
    subtitle,
    status,
    timestamp: new Date().toISOString(),
  };

  const existing = readActivities();
  writeActivities([next, ...existing]);
};

export const getAdminActivities = (limit = 20): AdminActivityRecord[] => {
  return readActivities().slice(0, Math.max(0, limit));
};

