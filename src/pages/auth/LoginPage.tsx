import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginSuccess } from '../../store/slices/authSlice';
import { usePharmacyLoginMutation } from '../../store/api/authApi';
import {
  Store,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Pill,
  Receipt,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [loginMutation, { isLoading }] = usePharmacyLoginMutation();

  const [pharmacyId, setPharmacyId] = useState('1001');
  const [phone, setPhone] = useState('017777777777');
  const [password, setPassword] = useState('Password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericId = parseInt(pharmacyId.trim(), 10);
    if (isNaN(numericId)) {
      setError('Pharmacy ID must be a valid number (e.g. 1001).');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your registered phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const response = await loginMutation({
        pharmacyId: numericId,
        phone: phone.trim(),
        password,
      }).unwrap();

      if (response.success && response.token) {
        dispatch(
          loginSuccess({
            token: response.token,
            user: response.user,
            pharmacy: response.pharmacy,
          })
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Invalid Pharmacy ID, phone number or password. Please verify credentials.';
      setError(msg);
    }
  };

  const handleQuickFill = (code: string, userPhone: string, userPass: string) => {
    setPharmacyId(code);
    setPhone(userPhone);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Brand Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between border-r border-slate-800/60 relative">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Netro Pharmacy
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    POS
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Retail Multi-Branch Pharmacy Management</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Unit Stock System</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Carton ➔ Strip ➔ Piece conversion with automatic stock deductions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rapid POS Counter Billing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fast barcode search, discount allocation, digital receipts and cash management.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Branch-Scoped Security</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Independent pharmacy login strictly bounded to your branch code and role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800 text-[11px] text-slate-500">
            Powered by Netro Hospital & Pharmacy Cloud • v2.0
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Pharmacy Login</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your branch Pharmacy ID, phone number and password to start your shift.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Pharmacy Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Pharmacy ID / Branch Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={pharmacyId}
                    onChange={(e) => setPharmacyId(e.target.value)}
                    placeholder="e.g. 1001"
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number (Username) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01711998877"
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Pharmacy Counter</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Shortcuts */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Demo Credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('1001', '017777777777', 'Password123')}
                  className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 transition-colors cursor-pointer"
                >
                  Branch #1001 Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
