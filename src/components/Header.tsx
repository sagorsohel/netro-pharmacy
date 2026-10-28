import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ShoppingCart, Plus, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchQuery } from '../store/slices/inventorySlice';
import { logout } from '../store/slices/authSlice';

interface HeaderProps {
  onOpenPos: () => void;
  onOpenStockIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPos, onOpenStockIn }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchQuery = useAppSelector((state) => state.inventory.searchQuery);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
      {/* Search Input & Portal Tag */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-emerald-800 text-xs font-semibold">
          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
          <span>Pharmacy & POS Operations</span>
        </div>

        <div className="relative w-64 sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search medicine by name, generic, barcode..."
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary text-xs sm:text-sm text-dark rounded-xl"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenStockIn}
          variant="outline"
          className="h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-300 gap-1.5 cursor-pointer rounded-xl"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Stock-In Entry</span>
        </Button>

        <Button
          onClick={onOpenPos}
          variant="default"
          className="h-9 px-3.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5 shadow-sm rounded-xl cursor-pointer"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>New POS Sale</span>
        </Button>

        {/* Notifications */}
        <button
          title="3 FEFO Expiry Alerts"
          className="relative p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Profile & Quick Logout */}
        <div className="flex items-center gap-2">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
          />
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
