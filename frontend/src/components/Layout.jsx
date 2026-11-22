import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'My Groups', icon: Users },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
];

const adminNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/groups', label: 'Groups', icon: Users },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = isAdmin ? adminNav : studentNav;
  const current = nav.find((n) => n.to === location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const NavItems = () => (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">SGAMS</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Joineazy</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Professor panel' : 'Student panel'}
          </p>
          <NavItems />
        </div>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-1.5 text-sm text-slate-400 sm:flex">
              <span>SGAMS</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-slate-700">{current?.label || 'Home'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
            <Avatar name={user?.name} />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
