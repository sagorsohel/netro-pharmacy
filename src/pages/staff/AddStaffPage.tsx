import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useCreateStaffMutation, type PharmacyRole } from '../../store/api/staffApi';
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ROLES: { id: PharmacyRole; label: string; desc: string }[] = [
  { id: 'pharmacist', label: 'Pharmacist', desc: 'Dispenses medicines, manages inventory & stock counts' },
  { id: 'cashier', label: 'Cashier', desc: 'Handles counter sales, billing tickets & invoice printing' },
  { id: 'manager', label: 'Branch Manager', desc: 'Oversees daily operations, shifts & personnel' },
  { id: 'staff', label: 'General Staff', desc: 'Store assistant & inventory replenishment helper' },
  { id: 'owner', label: 'Co-Owner', desc: 'Full administrative access to the pharmacy branch' },
];

export const AddStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { pharmacy } = useAppSelector((state) => state.auth);
  const pharmacyId = pharmacy?.id || 1001;

  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PharmacyRole>('pharmacist');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!name.trim()) return setErrorBanner('Staff full name is required.');
    if (!phone.trim()) return setErrorBanner('Phone number is required (used for logging in).');
    if (!password.trim() || password.length < 6) {
      return setErrorBanner('Password must be at least 6 characters.');
    }

    try {
      await createStaff({
        pharmacyId,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          role,
          password: password.trim(),
        },
      }).unwrap();

      navigate('/staff');
    } catch (err: any) {
      setErrorBanner(
        err?.data?.message ||
        'Failed to add staff member. Check if phone number is already registered in this branch.'
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none font-sans text-xs pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/staff"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Staff Directory</span>
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Dedicated Add Staff Page
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h1 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-emerald-600" />
            <span>Add New Staff Member</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision a new user account for Pharmacy #{pharmacyId} with dedicated role permissions.
          </p>
        </div>

        {errorBanner && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Staff Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Tanvir Ahmed"
                className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Phone Number (Login ID) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01811223344"
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tanvir@pharmacy.com"
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 block">
              Assign Role & Responsibilities <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLES.map((r) => {
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${selected ? 'text-emerald-800' : 'text-dark'}`}>
                        {r.label}
                      </span>
                      {selected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Password */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700">
              Initial Login Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter minimum 6 characters"
                className="w-full h-9.5 pl-9 pr-10 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              The user logs in at the login screen with Pharmacy ID #{pharmacyId}, this phone number, and this password.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/staff"
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
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Add Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffPage;
