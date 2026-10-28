import React from 'react';
import { CreditCard, TrendingUp, Boxes, CalendarClock, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../store/hooks';

export const StatsCards: React.FC = () => {
  const medicines = useAppSelector((state) => state.inventory.medicines);
  const invoices = useAppSelector((state) => state.pos.invoices);

  const totalSalesToday = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const lowStockCount = medicines.filter(
    (m) => m.totalPieces <= m.minThresholdPieces
  ).length;

  const nearExpiryCount = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = new Date('2026-10-27').getTime();
    const daysDiff = (exp - now) / (1000 * 3600 * 24);
    return daysDiff <= 60;
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today's Pharmacy Sales
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalSalesToday.toLocaleString()}
          </div>
          <div className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3.5 w-3.5" /> +12.5% increase ({invoices.length} invoices)
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <CreditCard className="h-6 w-6" />
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Stock Valuation
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">$845,000</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            {medicines.length} Active Branded Medicines
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary">
          <Boxes className="h-6 w-6" />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            FEFO Expiry Alerts
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {nearExpiryCount} Batches
          </div>
          <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-1">
            <CalendarClock className="h-3.5 w-3.5" /> Expiring within 60 days
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Low-Stock Alerts
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {lowStockCount} Items
          </div>
          <div className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
            Reorder threshold exceeded
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
