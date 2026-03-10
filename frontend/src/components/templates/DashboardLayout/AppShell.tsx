import { useEffect, useId, useState } from "react";
import SideBar from "../../organisms/SideBar/SideBar";
import TopBar from "../../organisms/TopBar/TopBar";
import { Outlet } from "react-router-dom";

const Appshell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileSidebarId = useId();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
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
          <SideBar
            collapsed={false}
            showToggle={false}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </div>
      </div>

      <div
        className="hidden border-r border-gray-200 bg-white md:block"
      >
        <SideBar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      </div>

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <TopBar
          onMenuClick={() => setMobileMenuOpen(true)}
          menuOpen={mobileMenuOpen}
          menuControlsId={mobileSidebarId}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appshell;
