import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  useGetMedicineByIdQuery,
  useUpdateMedicineMutation,
} from '../../store/api/medicineApi';
import {
  ArrowLeft,
  AlertCircle,
  Edit2,
} from 'lucide-react';

export const EditMedicinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading: isFetching } = useGetMedicineByIdQuery(id!, {
    skip: !id,
  });
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateMedicineMutation();

  const [name, setName] = useState('');
  const [generic, setGeneric] = useState('');
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [cartonQty, setCartonQty] = useState<number>(0);
  const [packetPerCarton, setPacketPerCarton] = useState<number>(10);
  const [piecePerPacket, setPiecePerPacket] = useState<number>(10);
  const [totalPieces, setTotalPieces] = useState<number>(0);
  const [unitSellingPrice, setUnitSellingPrice] = useState<string>('0');
  const [stripSellingPrice, setStripSellingPrice] = useState<string>('0');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [minThresholdPieces, setMinThresholdPieces] = useState<number>(100);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (response?.data) {
      const med = response.data;
      setName(med.name || '');
      setGeneric(med.generic || '');
      setCategory(med.category || 'Tablet');
      setSupplier(med.supplier || '');
      setCartonQty(Number(med.cartonQty) || 0);
      setPacketPerCarton(Number(med.packetPerCarton) || 10);
      setPiecePerPacket(Number(med.piecePerPacket) || 10);
      setTotalPieces(Number(med.totalPieces) || 0);
      setUnitSellingPrice(String(med.unitSellingPrice || '0'));
      setStripSellingPrice(String(med.stripSellingPrice || '0'));
      setBatchNo(med.batchNo || '');
      setExpiryDate(med.expiryDate || '');
      setMinThresholdPieces(Number(med.minThresholdPieces) || 100);
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorBanner(null);

    try {
      await updateMedicine({
        id,
        data: {
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
        },
      }).unwrap();

      navigate('/inventory');
    } catch (err: any) {
      setErrorBanner(err?.data?.message || 'Failed to update medicine details.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none font-sans text-xs pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Medicine Stock</span>
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Edit Item #{id}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h1 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-emerald-600" />
            <span>Edit Medicine Details & Stock Levels</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update inventory counts, pricing adjustments, or batch expiry details.
          </p>
        </div>

        {errorBanner && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorBanner}</span>
          </div>
        )}

        {isFetching ? (
          <div className="py-16 text-center text-slate-400">Loading medicine data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Brand Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Generic Formula</label>
                <input
                  type="text"
                  value={generic}
                  onChange={(e) => setGeneric(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                Multi-Unit Stock & Quantity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cartons</label>
                  <input
                    type="number"
                    value={cartonQty}
                    onChange={(e) => setCartonQty(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pkts/Carton</label>
                  <input
                    type="number"
                    value={packetPerCarton}
                    onChange={(e) => setPacketPerCarton(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pcs/Pkt</label>
                  <input
                    type="number"
                    value={piecePerPacket}
                    onChange={(e) => setPiecePerPacket(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Pieces</label>
                  <input
                    type="number"
                    value={totalPieces}
                    onChange={(e) => setTotalPieces(Number(e.target.value))}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                Pricing & Batch
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit Price (Tk)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitSellingPrice}
                    onChange={(e) => setUnitSellingPrice(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Strip Price (Tk)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stripSellingPrice}
                    onChange={(e) => setStripSellingPrice(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Batch No</label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/inventory"
                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer flex items-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUpdating}
                className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Update Medicine'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMedicinePage;
