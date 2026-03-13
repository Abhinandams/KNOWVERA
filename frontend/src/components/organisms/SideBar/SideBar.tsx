import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../../utils/authStorage";

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' as const },
  { to: '/admin/books', label: 'Books', icon: 'books' as const },
  { to: '/admin/issues', label: 'Issue & Return', icon: 'issue' as const },
  { to: '/admin/users', label: 'Users', icon: 'users' as const },
  { to: '/admin/fines', label: 'Fine Details', icon: 'fines' as const },
  { to: '/admin/reservations', label: 'Reservations', icon: 'reservations' as const },
];

type IconName = (typeof items)[number]["icon"];

const NavIcon = ({ name, className = "" }: { name: IconName; className?: string }) => {
  const common = "h-5 w-5";

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "books":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
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
    case "issue":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
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
    case "users":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
          <path
            d="M16.5 21c0-2.5-2.1-4.5-4.8-4.5S7 18.5 7 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 12.2a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 21c0-1.9-1-3.5-2.6-4.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16.8 12a2.7 2.7 0 1 0 0-5.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "fines":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 7v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M15 9.2c0-1.2-1.3-2.2-3-2.2s-3 1-3 2.2 1.3 2.2 3 2.2 3 1 3 2.2-1.3 2.2-3 2.2-3-1-3-2.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "reservations":
      return (
        <svg viewBox="0 0 24 24" className={`${common} ${className}`} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 7v5l3 2"
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

type Props = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showToggle?: boolean;
  onNavigate?: () => void;
};

const SideBar: React.FC<Props> = ({ collapsed = false, onToggleCollapse, showToggle = true, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    onNavigate?.();
    navigate("/login");
  };

  return (
    <aside
      className={`flex h-screen flex-col overflow-hidden border-r border-gray-100 bg-white ${
        collapsed ? "w-16 p-3" : "w-64 p-6 md:w-72"
      }`}
    >
      <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <div className="text-2xl font-bold text-emerald-800">KNOWVERA</div>}
        {showToggle && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {items.map((it) => (
          <NavLink
            to={it.to}
            key={it.to}
            title={it.label}
            aria-label={it.label}
            onClick={onNavigate}
            className={({ isActive }) =>
              collapsed
                ? `group flex items-center justify-center rounded px-2 py-2 ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-emerald-700 hover:bg-emerald-200"
                  }`
                : `group flex items-center gap-3 rounded px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-emerald-500 text-white" : "text-emerald-700 hover:bg-emerald-200"
                  }`
            }
          >
            {collapsed && <span className="sr-only">{it.label}</span>}
            <NavIcon name={it.icon} className="text-current" />
            {!collapsed && <span className="min-w-0 truncate">{it.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className={
            collapsed
              ? "flex w-full items-center justify-center rounded px-2 py-2 text-emerald-700 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-primary"
              : "flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-primary"
          }
          aria-label="Logout"
          title="Logout"
        >
          {collapsed && <span className="sr-only">Logout</span>}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12H4m0 0 3-3m-3 3 3 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && <span className="min-w-0 truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
