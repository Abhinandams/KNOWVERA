import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUserById } from "../../../api/userApi";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { clearAuthSession, getAuthItem } from "../../../utils/authStorage";

type Props = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
  menuControlsId?: string;
  title?: string;
};

const TopBar = ({
  onMenuClick,
  menuOpen = false,
  menuControlsId,
  title = "Library Overview",
}: Props) => {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const [role, setRole] = useState(getAuthItem("role") ?? "user");
  const [email, setEmail] = useState(getAuthItem("email") ?? "-");

  useEffect(() => {
    const loadProfile = async () => {
      const userId = getAuthItem("userId");
      const storedEmail = getAuthItem("email");
      const storedRole = getAuthItem("role");
      if (storedEmail) setEmail(storedEmail);
      if (storedRole) setRole(storedRole);

      if (!userId) return;
      try {
        const user = await getAdminUserById(userId);
        const fullName = `${String(user.fname ?? "")} ${String(user.lname ?? "")}`.trim();
        setName(fullName || String(user.email ?? storedEmail ?? "User"));
        setEmail(String(user.email ?? storedEmail ?? "-"));
        setRole(String(user.role ?? storedRole ?? "user"));
      } catch {
        setName(storedEmail ?? "User");
      }
    };
    loadProfile();
  }, []);

  const avatarText = useMemo(() => name.charAt(0).toUpperCase() || "U", [name]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={menuControlsId}
        >
          ☰
        </button>
        <h1 className="min-w-0 truncate text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
          {title}
        </h1>
      </div>

      <div className="shrink-0">
        <ProfileMenu
          name={name}
          role={role}
          email={email}
          avatarText={avatarText}
          onProfile={() => navigate("/admin/profile")}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};

export default TopBar;
