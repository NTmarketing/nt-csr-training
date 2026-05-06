import { LogOut, ShieldCheck } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="no-print sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/brand/nt-mark.png" alt="Neighbors Trailer" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold text-nt-text-primary">CSR Training</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-nt-green-50 text-nt-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Dashboard
            </NavLink>

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-nt-green-50 text-nt-green-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </NavLink>
            )}

            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">@{user?.username}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary !px-2.5 !py-1.5"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
