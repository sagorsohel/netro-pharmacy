import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutGrid,
  ShoppingCart,
  Pill,
  PlusCircle,
  Receipt,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

export const PharmacySidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pharmacy } = useAppSelector((state) => state.auth);
  const role = (user?.role || 'staff').toLowerCase();
  const isOwnerOrManager = role === 'owner' || role === 'manager';

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'pos', path: '/pos', label: 'POS Billing Counter', icon: ShoppingCart },
    { id: 'inventory', path: '/inventory', label: 'Medicine Stock', icon: Pill },
    { id: 'stock-in', path: '/inventory/stock-in', label: 'Stock-In Medicine', icon: PlusCircle },
    { id: 'invoices', path: '/invoices', label: 'Sales & Invoices', icon: Receipt },
    ...(isOwnerOrManager
      ? [{ id: 'staff', path: '/staff', label: 'Branch Staff', icon: Users }]
      : []),
    { id: 'settings', path: '/settings', label: 'Profile & Settings', icon: Settings },
  ];

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/');
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/inventory') return location.pathname === '/inventory';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-56 h-full bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between shrink-0 select-none overflow-hidden">
      {/* Navigation Menu */}
      <nav
        className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 pr-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pharmacy Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-dark hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Sign Out Footer */}
      <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-500/20 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden text-left">
            <h5 className="text-xs font-bold text-dark truncate">
              {user?.name || 'Staff User'}
            </h5>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {user?.phone || 'Pharmacy ID #' + (pharmacy?.id || '1001')}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          type="button"
          className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
