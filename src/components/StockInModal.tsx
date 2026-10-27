import React, { useState } from 'react';
import { PackagePlus, Boxes } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { addStockIn } from '../store/slices/inventorySlice';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [generic, setGeneric] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [cartonQty, setCartonQty] = useState(10);
  const [packetPerCarton, setPacketPerCarton] = useState(10);
  const [piecePerPacket, setPiecePerPacket] = useState(10);
  const [batchNo, setBatchNo] = useState(`BATCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [unitSellingPrice, setUnitSellingPrice] = useState(5.0);
  const [stripSellingPrice, setStripSellingPrice] = useState(50.0);
  const [supplier, setSupplier] = useState('Square Pharmaceuticals');

  if (!isOpen) return null;

  const totalCalculatedPieces = cartonQty * packetPerCarton * piecePerPacket;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('ওষুধের নাম লিখুন');
      return;
    }

    dispatch(
      addStockIn({
        name,
        generic: generic || name,
        category,
        cartonQty: Number(cartonQty),
        packetPerCarton: Number(packetPerCarton),
        piecePerPacket: Number(piecePerPacket),
        batchNo,
        expiryDate,
        unitSellingPrice: Number(unitSellingPrice),
        stripSellingPrice: Number(stripSellingPrice),
        supplier,
        branch: 'Main Hospital Pharmacy',
      })
    );

    onClose();
    onSuccess(
      `নতুন স্টক এন্ট্রি সফল! ${name} (${totalCalculatedPieces} পিস) ইনভেন্টরিতে যুক্ত হয়েছে।`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">নতুন ওষুধ স্টক-ইন ও চালান এন্ট্রি</h3>
              <p className="text-xs text-slate-500">
                কার্টুন, প্যাকেট ও পিস স্বয়ংক্রিয় কনভার্সন এবং বিক্রয় মূল্য নির্ধারণ।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ওষুধের ব্র্যান্ডের নাম *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Napa 500mg"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">জেনেরিক নাম</label>
              <Input
                value={generic}
                onChange={(e) => setGeneric(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Cardiovascular">Cardiovascular</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ব্যাচ নম্বর</label>
              <Input
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="h-10 text-xs rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">মেয়াদের তারিখ (FEFO)</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Multi-unit Conversion Block */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Boxes className="h-4 w-4 text-primary" />
              <span>মাল্টি-ইউনিট স্টক কনভার্সন সেটআপ</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-emerald-800 block mb-1">কার্টুন সংখ্যা</label>
                <Input
                  type="number"
                  min="1"
                  value={cartonQty}
                  onChange={(e) => setCartonQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 bg-white text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-emerald-800 block mb-1">প্রতি কার্টুনে প্যাকেট/পাতা</label>
                <Input
                  type="number"
                  min="1"
                  value={packetPerCarton}
                  onChange={(e) => setPacketPerCarton(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 bg-white text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-emerald-800 block mb-1">প্রতি প্যাকেটে পিস</label>
                <Input
                  type="number"
                  min="1"
                  value={piecePerPacket}
                  onChange={(e) => setPiecePerPacket(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 bg-white text-xs rounded-xl"
                />
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-950 flex justify-between pt-1 border-t border-emerald-200">
              <span>স্বয়ংক্রিয় গণনা (মোট স্টক):</span>
              <span className="font-black text-primary text-sm">
                {totalCalculatedPieces.toLocaleString()} পিস ওষুধ
              </span>
            </div>
          </div>

          {/* Pricing & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">বিক্রয় মূল্য (পিস)</label>
              <Input
                type="number"
                step="0.1"
                value={unitSellingPrice}
                onChange={(e) => setUnitSellingPrice(parseFloat(e.target.value) || 0)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">বিক্রয় মূল্য (পাতা/প্যাকেট)</label>
              <Input
                type="number"
                step="0.5"
                value={stripSellingPrice}
                onChange={(e) => setStripSellingPrice(parseFloat(e.target.value) || 0)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">সাপ্লায়ার কোম্পানি</label>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Beximco Pharma"
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs h-10 px-5 cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 px-6 gap-2 shadow-lg shadow-primary/25 cursor-pointer"
            >
              <PackagePlus className="h-4 w-4" />
              <span>স্টক সংরক্ষণ করুন</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
