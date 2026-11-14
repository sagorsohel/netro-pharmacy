import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateMedicineMutation } from '../../store/api/medicineApi';
import {
  ArrowLeft,
  Pill,
  Boxes,
  PlusCircle,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StockInPage: React.FC = () => {
  const navigate = useNavigate();
  const [createMedicine, { isLoading }] = useCreateMedicineMutation();

  // Form State
  const [name, setName] = useState('');
  const [generic, setGeneric] = useState('');
  const [category, setCategory] = useState('Tablet');
  const [supplier, setSupplier] = useState('Square Pharmaceuticals');

  // Multi-unit packaging
  const [cartonQty, setCartonQty] = useState<number>(10);
  const [packetPerCarton, setPacketPerCarton] = useState<number>(20);
  const [piecePerPacket, setPiecePerPacket] = useState<number>(10);

  // Pricing & Batch
  const [unitSellingPrice, setUnitSellingPrice] = useState<string>('3.50');
  const [stripSellingPrice, setStripSellingPrice] = useState<string>('35.00');
  const [batchNo, setBatchNo] = useState(`BATCH-${Date.now().toString().slice(-4)}`);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [minThresholdPieces, setMinThresholdPieces] = useState<number>(200);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Dynamic calculation
  const totalPieces = cartonQty * packetPerCarton * piecePerPacket;

  const handlePiecePriceChange = (val: string) => {
    setUnitSellingPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setStripSellingPrice((num * piecePerPacket).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!name.trim()) return setErrorBanner('Medicine brand name is required.');
    if (!generic.trim()) return setErrorBanner('Generic composition is required.');
    if (!unitSellingPrice) return setErrorBanner('Unit selling price is required.');

    try {
      await createMedicine({
        name: name.trim(),
        generic: generic.trim(),
        category,
        supplier: supplier.trim(),
        cartonQty,
        packetPerCarton,
        piecePerPacket,
        totalPieces,
        unitSellingPrice,
        stripSellingPrice,
        batchNo: batchNo.trim(),
        expiryDate,
        minThresholdPieces,
      }).unwrap();

      navigate('/inventory');
    } catch (err: any) {
      setErrorBanner(err?.data?.message || 'Failed to record medicine in inventory.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none font-sans text-xs pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Medicine Stock</span>
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Dedicated Stock-In Page
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h1 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-emerald-600" />
            <span>Stock-In New Medicine Batch</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register a new drug brand, configure multi-unit packaging ratios, prices, and batch expiry.
          </p>
        </div>

        {errorBanner && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Brand & Category */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                <span>1. Drug Brand & Generic Information</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Brand Name & Dosage <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Napa Extra 500mg"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Generic Formula <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={generic}
                  onChange={(e) => setGeneric(e.target.value)}
                  placeholder="e.g. Paracetamol + Caffeine"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Drug Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Tablet">Tablet (Oral)</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup / Suspension</option>
                  <option value="Eye Drops">Eye Drops (Ophthalmic)</option>
                  <option value="Injection">Injection (IV/IM)</option>
                  <option value="Ointment">Ointment / Cream</option>
                  <option value="Inhaler">Inhaler / Resp</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Manufacturer / Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Square Pharmaceuticals PLC"
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Unit Packaging System */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-600" />
                <span>2. Multi-Unit Packaging Breakdown</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Conversion
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Calculated Stock In Pieces
                </span>
                <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
                  {totalPieces.toLocaleString()} Pieces
                </div>
              </div>
              <div className="text-[11px] font-mono text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                {cartonQty} Cartons × {packetPerCarton} Packets × {piecePerPacket} Pcs = {totalPieces} Pcs
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Carton Quantity Received</label>
                <input
                  type="number"
                  min="0"
                  value={cartonQty}
                  onChange={(e) => setCartonQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Total physical cartons/boxes</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Packets per Carton (Strips)</label>
                <input
                  type="number"
                  min="1"
                  value={packetPerCarton}
                  onChange={(e) => setPacketPerCarton(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Strips/packets inside each carton</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pieces per Packet</label>
                <input
                  type="number"
                  min="1"
                  value={piecePerPacket}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setPiecePerPacket(val);
                    const unitPrice = parseFloat(unitSellingPrice);
                    if (!isNaN(unitPrice)) {
                      setStripSellingPrice((unitPrice * val).toFixed(2));
                    }
                  }}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Individual pills/tablets in a strip</span>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Expiry */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>3. Selling Pricing, Batch & Expiry</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Unit Price (Tk / pc)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitSellingPrice}
                  onChange={(e) => handlePiecePriceChange(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Strip Price (Tk / strip)</label>
                <input
                  type="number"
                  step="0.01"
                  value={stripSellingPrice}
                  onChange={(e) => setStripSellingPrice(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Batch Number</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:w-1/2">
              <label className="font-bold text-slate-700">Low Stock Reorder Threshold (Pieces)</label>
              <input
                type="number"
                value={minThresholdPieces}
                onChange={(e) => setMinThresholdPieces(parseInt(e.target.value, 10) || 100)}
                className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                Triggers warning dashboard alert when total pieces fall below this number.
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/inventory"
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recording Medicine...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Stock-In Medicine & Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInPage;
