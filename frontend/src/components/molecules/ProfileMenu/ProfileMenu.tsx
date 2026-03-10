import { useState } from "react";

type Props = {
  name: string;
  role: string;
  email: string;
  avatarText?: string;
  onLogout?: () => void;
};

const ProfileMenu = ({ name, role, email, avatarText, onLogout }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const fallbackAvatar = avatarText ?? name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="profile-name max-w-[12rem] truncate text-sm text-gray-700">{name}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-200 text-sm font-semibold text-violet-700">
          {fallbackAvatar}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-64 max-w-[85vw] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-200 text-sm font-semibold text-violet-700">
              {fallbackAvatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm text-gray-700">{email}</p>
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="w-full rounded-md border border-red-200 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
