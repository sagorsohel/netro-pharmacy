import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { InventoryTable } from './InventoryTable';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { PosCounterModal } from './PosCounterModal';
import { StockInModal } from './StockInModal';
import { Pill, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

export const PharmacyDashboardView: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans text-dark">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenPos={() => setIsPosOpen(true)}
        onOpenStockIn={() => setIsStockInOpen(true)}
      />

      {/* Scrollable Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenPos={() => setIsPosOpen(true)}
          onOpenStockIn={() => setIsStockInOpen(true)}
        />

        <main
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary via-primary-hover to-emerald-950 rounded-3xl p-7 text-white shadow-xl shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <Pill className="h-3.5 w-3.5 text-cream" />
                <span>Netro Pharmacy Inventory & POS System</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">ফার্মেসি ম্যানেজমেন্ট ও পয়েন্ট অব সেলস</h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                মাল্টি-ইউনিট স্টক কনভার্সন (কার্টুন ➔ প্যাকেট ➔ পিস), FEFO এক্সপায়ারি ট্র্যাকিং, WhatsApp ইনভয়েস এবং সেন্ট্রালাইজড ব্রাঞ্চ কন্ট্রোল।
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsPosOpen(true)}
                className="bg-white text-primary hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl shadow-lg text-xs gap-2 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>কাউন্টার POS বিল</span>
              </Button>
            </div>
          </div>

          {/* KPI Stats Cards */}
          <StatsCards />

          {/* Section 1: Multi-Unit Stock Inventory Table */}
          <InventoryTable onOpenStockIn={() => setIsStockInOpen(true)} />

          {/* Section 2: Recent POS Invoices & Messaging */}
          <RecentInvoicesTable onOpenPos={() => setIsPosOpen(true)} />
        </main>
      </div>

      {/* POS Counter Billing Modal */}
      <PosCounterModal
        isOpen={isPosOpen}
        onClose={() => setIsPosOpen(false)}
        onSaleSuccess={(msg) => showToast(msg)}
      />

      {/* Stock-In Modal */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
