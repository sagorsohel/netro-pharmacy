import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  Store,
  ShoppingCart,
  PlusCircle,
  Calendar,
} from 'lucide-react';

export const PharmacyHeader: React.FC = () => {
  const { user, pharmacy } = useAppSelector((state) => state.auth);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 px-5 sm:px-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between shrink-0 select-none">
      {/* Left: Pharmacy Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-dark tracking-tight">
              {pharmacy?.name || 'Netro Care Pharmacy'}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              #{pharmacy?.id || '1001'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live POS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
            {pharmacy?.address || 'Hospital Retail Pharmacy Branch'}
          </p>
        </div>
      </div>

      {/* Right: Date, Fast Actions, User Status */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{today}</span>
        </div>

        {/* Quick POS Button */}
        <Link
          to="/pos"
          className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">POS Counter</span>
        </Link>

        {/* Stock-In Button */}
        <Link
          to="/inventory/stock-in"
          className="hidden sm:flex h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 text-emerald-600" />
          <span>Stock-In</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-500/20 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-dark truncate max-w-[120px]">
              {user?.name || 'Staff User'}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold capitalize">
              {user?.role || 'Staff'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
