import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserCircle2Icon,
  Wand2Icon,
  LinkIcon,
  LifeBuoyIcon,
  Settings2Icon,
  HourglassIcon,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AnimatedLogo } from "./AnimatedLogo";

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
    { name: "Accounts", icon: LinkIcon, path: "/accounts" },
    { name: "Scheduler", icon: CalendarDaysIcon, path: "/schedule" },
    { name: "AI Composer", icon: Wand2Icon, path: "/ai-composer" },
    { name: "Support", icon: LifeBuoyIcon, path: "/support" },
    { name: "Profile", icon: UserCircle2Icon, path: "/profile" },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Admin Panel", icon: Settings2Icon, path: "/admin" });
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
      flex flex-col h-full transform transition-transform duration-200 ease-in-out
      md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 pb-4">
        <div className="text-xl tracking-tight text-slate-900 flex items-center gap-2.5 font-black">
          <AnimatedLogo className="size-8 bg-slate-900 text-white shadow-md shadow-slate-900/20" iconClassName="size-4" />
          Scheduler
        </div>
      </div>

      <div className="px-6 py-2 mt-2">
        <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-bold">
          Menu
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
              transition-all duration-300 border relative overflow-hidden font-semibold ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <item.icon
                className={`size-[18px] shrink-0 transition-transform duration-200 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 border-t border-slate-100" />

      <div className="p-4">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            navigate('/profile')
          }}
          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200 hover:bg-slate-50 group border border-transparent hover:border-slate-200"
        >
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm ${
              user?.profilePicture
                ? "bg-slate-100 border border-slate-200"
                : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_10px_rgba(59,130,246,0.3)] text-white"
            }`}
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {user?.name || 'User'}
            </span>
            <span className="truncate text-xs font-medium text-slate-500">
              {user?.email}
            </span>
          </div>
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-50"
        >
          <LogOutIcon className="size-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
