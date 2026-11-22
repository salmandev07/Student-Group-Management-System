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
import { AnimatedBackground } from './Animated';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'My Groups', icon: Users },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
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

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#050814]/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#0b1026]/85 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/50">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight text-white">SGAMS</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Joineazy</span>
              </span>
            </button>
            <button className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {isAdmin ? 'Professor workspace' : 'Student workspace'}
            </p>
            <nav className="space-y-1.5">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-400/20 shadow-lg shadow-indigo-950/20'
                        : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/10 p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1026]/65 px-4 backdrop-blur-2xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-1.5 text-sm text-white/40 sm:flex">
                <span>SGAMS</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-white/85">{current?.label || 'Home'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs capitalize text-white/40">{user?.role}</p>
              </div>
              <Avatar name={user?.name} />
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-white/50 transition hover:bg-red-500/10 hover:text-red-200"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            <div key={location.pathname} className="animate-fade-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
