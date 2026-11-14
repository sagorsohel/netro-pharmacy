import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useChangePasswordMutation } from '../../store/api/authApi';
import {
  Settings,
  Store,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  FileBadge,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, pharmacy } = useAppSelector((state) => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!currentPassword) {
      return setNotification({ type: 'error', message: 'Current password is required.' });
    }
    if (newPassword.length < 6) {
      return setNotification({ type: 'error', message: 'New password must be at least 6 characters.' });
    }
    if (newPassword !== confirmPassword) {
      return setNotification({ type: 'error', message: 'New passwords do not match.' });
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      setNotification({
        type: 'success',
        message: res.message || 'Password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to change password. Verify your current password.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none font-sans text-xs pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-600" />
          <span>Pharmacy & Profile Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View branch outlet identity, check your active login profile, and change account passwords.
        </p>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Branch & Profile Cards */}
        <div className="space-y-6">
          {/* Branch Outlet Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-dark text-sm">
                  {pharmacy?.name || 'Netro Care Pharmacy'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Branch Code #{pharmacy?.id || '1001'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Physical Address
                  </span>
                  <span className="font-medium text-dark">{pharmacy?.address || 'Not specified'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Outlet Phone
                  </span>
                  <span className="font-medium text-dark">{pharmacy?.phone || 'Not specified'}</span>
                </div>
              </div>

              {pharmacy?.licenseNo && (
                <div className="flex items-start gap-2.5">
                  <FileBadge className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Drug License No
                    </span>
                    <span className="font-mono font-bold text-dark">{pharmacy.licenseNo}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Account Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-sm ring-1 ring-emerald-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-dark text-sm">{user?.name || 'Staff User'}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {user?.role || 'Staff'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-slate-600">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Login Phone Number
                  </span>
                  <span className="font-mono font-bold text-dark">{user?.phone || 'None'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Email Address
                  </span>
                  <span className="font-medium text-dark">{user?.email || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-dark text-sm">Change Account Password</h3>
              <p className="text-[11px] text-slate-400">Update your individual login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Current Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Confirm New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[11px] font-bold text-slate-500 hover:text-dark flex items-center gap-1 cursor-pointer"
              >
                {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPass ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
