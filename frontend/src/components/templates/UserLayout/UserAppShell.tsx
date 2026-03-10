import { useEffect, useId, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import ProfileMenu from "../../molecules/ProfileMenu/ProfileMenu";
import { getAdminUserById } from "../../../api/userApi";

const resolveTitle = (pathname: string) => {
  if (pathname.startsWith("/user/books/")) return "Book Information";
  if (pathname.startsWith("/user/books")) return "Books";
  if (pathname.startsWith("/user/status")) return "Status";
  return "DASHBOARD";
};

type UserIconName = "dashboard" | "books" | "status";

const UserNavIcon = ({ name, className = "" }: { name: UserIconName; className?: string }) => {
  const common = `h-5 w-5 ${className}`;
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "books":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M4.5 6.5c0-1.1.9-2 2-2H12c2 0 3.5 1 3.5 3v12c-.8-.7-2-1.2-3.5-1.2H6.5c-1.1 0-2-.9-2-2v-9.8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 6.5c0-1.1-.9-2-2-2H12c-2 0-3.5 1-3.5 3v12c.8-.7 2-1.2 3.5-1.2h5.5c1.1 0 2-.9 2-2v-9.8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "status":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M7 8h10M7 8l3-3M7 8l3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 16H7M17 16l-3-3M17 16l-3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

const UserAppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = resolveTitle(location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileSidebarId = useId();
  const [name, setName] = useState("User");
  const [role, setRole] = useState(localStorage.getItem("role") ?? "user");
  const [email, setEmail] = useState(localStorage.getItem("email") ?? "-");

  useEffect(() => {
    const loadProfile = async () => {
      const userId = localStorage.getItem("userId");
      const storedEmail = localStorage.getItem("email");
      const storedRole = localStorage.getItem("role");
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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const navClassName = (isActive: boolean, compact: boolean) =>
    compact
      ? `flex items-center justify-center rounded-lg px-2 py-2 text-sm font-semibold ${
          isActive ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"
        }`
      : `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium ${
          isActive ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-emerald-100"
        }`;

  const navContent = (compact: boolean, onNavigate?: () => void) => (
    <nav className="space-y-2">
      <NavLink
        to="/user/dashboard"
        title="Dashboard"
        aria-label="Dashboard"
        onClick={onNavigate}
        className={({ isActive }) => navClassName(isActive, compact)}
      >
        {compact && <span className="sr-only">Dashboard</span>}
        <UserNavIcon name="dashboard" className="text-current" />
        {!compact && <span className="min-w-0 truncate">Dashboard</span>}
      </NavLink>
      <NavLink
        to="/user/books"
        title="Books"
        aria-label="Books"
        onClick={onNavigate}
        className={({ isActive }) => navClassName(isActive, compact)}
      >
        {compact && <span className="sr-only">Books</span>}
        <UserNavIcon name="books" className="text-current" />
        {!compact && <span className="min-w-0 truncate">Books</span>}
      </NavLink>
      <NavLink
        to="/user/status"
        title="Status"
        aria-label="Status"
        onClick={onNavigate}
        className={({ isActive }) => navClassName(isActive, compact)}
      >
        {compact && <span className="sr-only">Status</span>}
        <UserNavIcon name="status" className="text-current" />
        {!compact && <span className="min-w-0 truncate">Status</span>}
      </NavLink>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile off-canvas sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <div
          id={mobileSidebarId}
          className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
        >
          <aside className="h-full overflow-y-auto border-r border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-2xl font-bold text-emerald-700">KNOWVERA</div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {navContent(false, () => setMobileMenuOpen(false))}
          </aside>
        </div>
      </div>

      <aside
        className={`hidden overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300 md:block ${
          collapsed ? "w-16 p-3" : "w-64 p-6 lg:w-72"
        }`}
      >
        <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <div className="text-2xl font-bold text-emerald-700">KNOWVERA</div>}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        {navContent(collapsed)}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileSidebarId}
            >
              ☰
            </button>
            <h1 className="min-w-0 truncate text-base font-semibold text-gray-900 md:text-lg">{title}</h1>
          </div>
          <div className="shrink-0">
            <ProfileMenu
              name={name}
              role={role}
              email={email}
              avatarText={avatarText}
              onLogout={handleLogout}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-4 sm:px-6 lg:px-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAppShell;
