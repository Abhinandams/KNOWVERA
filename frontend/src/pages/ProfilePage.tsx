import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/atoms/Badge/Badge";
import Button from "../components/atoms/Button/Button";
import ProfileInfoCard from "../components/molecules/Cards/ProfileInfoCard/ProfileInfoCard";
import { getAdminUserById, resolveUserProfileImage, type UserResponse } from "../api/userApi";
import { extractApiErrorMessage } from "../utils/apiError";
import { getAuthItem } from "../utils/authStorage";

type UiProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: "Active" | "Blocked";
  photo: string;
};

const toUiProfile = (user: UserResponse): UiProfile => {
  const status = String(user.status ?? "active").toLowerCase() === "blocked" ? "Blocked" : "Active";
  const role = String(user.role ?? "user").toUpperCase();
  const name = `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "User";
  return {
    id: String(user.userId),
    name,
    email: user.email ?? "-",
    phone: user.phone ?? "-",
    address: user.address ?? "-",
    role,
    status,
    photo: resolveUserProfileImage(user.profileImage),
  };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = String(getAuthItem("role") ?? "user").toUpperCase();
  const backPath = role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getAuthItem("userId");
        if (!userId) {
          setProfile(null);
          setError("Not logged in.");
          return;
        }
        const user = await getAdminUserById(userId);
        setProfile(toUiProfile(user));
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load profile."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const info = useMemo(() => {
    if (!profile) return [];
    return [
      { label: "User ID", value: profile.id },
      { label: "Email", value: profile.email },
      { label: "Phone", value: profile.phone },
      { label: "Address", value: profile.address },
      { label: "Role", value: profile.role },
    ];
  }, [profile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">View your account details.</p>
        </div>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(backPath)}>
          Back to Dashboard
        </Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading profile...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && profile && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-40 w-40 rounded-full border border-gray-200 object-cover"
              />
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-gray-900">{profile.name}</h3>
                <p className="truncate text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge text={profile.status} variant={profile.status === "Blocked" ? "danger" : "success"} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {info.map((item) => (
              <ProfileInfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

