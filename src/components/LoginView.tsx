import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginSuccess } from "../store/slices/authSlice";
import {
  ShoppingCart,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Pill,
  Boxes,
  CheckCircle2,
  Sparkles,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLoginMutation } from '../store/api/authApi';

export const LoginView: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();

  const [email, setEmail] = useState('pharmarcy@netro.com');
  const [password, setPassword] = useState('12345678');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const isLoading = isLoginLoading;

  // If already authenticated, redirect to /dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('');

    try {
      const data = await loginMutation({
        email: loginEmail.trim(),
        password: loginPass,
      }).unwrap();

      if (!data.success || !data.token) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      dispatch(
        loginSuccess({
          user: data.user,
          token: data.token,
        })
      );

      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to connect to backend server. Make sure port 5001 is active.';
      setError(message);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email or username");
      return;
    }
    performLogin(email, password);
  };

  const handleQuickDemo = (role: "pharmacist" | "admin") => {
    if (role === "pharmacist") {
      setEmail("pharmarcy@netro.com");
      setPassword("12345678");
      performLogin("pharmarcy@netro.com", "12345678");
    } else {
      setEmail("admin@netro.com");
      setPassword("12345678");
      performLogin("admin@netro.com", "12345678");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Brand Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between border-r border-slate-800/60 relative">
          <div className="relative z-10 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white">
                    NETRO
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/30 text-emerald-300 border border-primary/50">
                    PHARMA POS
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Inventory & Point of Sale System
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Modern Pharmacy & Point-of-Sale System
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Multi-unit stock conversion (Carton ➔ Strip ➔ Piece), FEFO
                expiry alerts, and fast WhatsApp invoicing.
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-3 pt-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <Boxes className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Multi-Unit Stock Tracking
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Automatic carton, strip, and piece conversions with live
                    stock counts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <Receipt className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Counter POS & Digital Billing
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Direct digital PDF invoices via WhatsApp and SMS receipt
                    delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <Pill className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    FEFO Expiry Monitoring
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Automated expiry alerts and low-stock replenishment
                    notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Neon DB +
              Drizzle Connected
            </span>
            <span className="text-slate-500">v1.0.0 Stable</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-7">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-primary border border-primary/20 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Backend JWT Authentication</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Pharmacist Sign In
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access the pharmacy management system.
              </p>
            </div>

            {error && (
              <div className="p-3.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pharmarcy@netro.com"
                  className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "Default password for pharmarcy@netro.com is: 12345678",
                      );
                    }}
                    className="text-xs text-secondary hover:underline font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Signing...</span>
                ) : (
                  <>
                    <span>Enter Pharmacy Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-center text-xs text-slate-400 mb-3 font-medium">
                — Or 1-Click Login with Verified Accounts —
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("pharmacist")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-primary/40 text-slate-700 hover:text-primary transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Pharmacy (pharmarcy@netro.com)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("admin")}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-secondary/40 text-slate-700 hover:text-secondary transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="h-4 w-4 text-secondary" />
                  <span>Admin (admin@netro.com)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
