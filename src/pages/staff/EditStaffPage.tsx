import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
  useResetStaffPasswordMutation,
  type PharmacyRole,
} from '../../store/api/staffApi';
import {
  ArrowLeft,
  Edit2,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const EditStaffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pharmacy } = useAppSelector((state) => state.auth);
  const pharmacyId = pharmacy?.id || 1001;

  const { data: response, isLoading: isFetching } = useGetStaffByIdQuery(
    { pharmacyId, userId: id! },
    { skip: !id }
  );

  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetStaffPasswordMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PharmacyRole>('pharmacist');
  const [isActive, setIsActive] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (response?.data) {
      const u = response.data;
      setName(u.name || '');
      setPhone(u.phone || '');
      setEmail(u.email || '');
      setRole(u.role || 'pharmacist');
      setIsActive(u.isActive !== undefined ? u.isActive : true);
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setNotification(null);

    try {
      await updateStaff({
        pharmacyId,
        userId: id,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          role,
          isActive,
        },
      }).unwrap();

      if (newPassword.trim().length >= 6) {
        await resetPassword({
          pharmacyId,
          userId: id,
          newPassword: newPassword.trim(),
        }).unwrap();
      }

      navigate('/staff');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to update staff member.',
      });
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
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Edit Staff #{id}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h1 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-emerald-600" />
            <span>Edit Staff Profile & Role</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update account details, change role assignments, or reset password for this user.
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

        {isFetching ? (
          <div className="py-16 text-center text-slate-400">Loading staff data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Staff Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone (Login ID)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as PharmacyRole)}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="owner">Owner / Co-Owner</option>
                  <option value="manager">Branch Manager</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="cashier">Cashier</option>
                  <option value="staff">General Staff</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Status</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className="w-full h-9.5 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="true">Active (Can Log in)</option>
                  <option value="false">Suspended / Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700">
                Change Password (Leave blank to keep existing)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (optional)"
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
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
                disabled={isUpdating || isResetting}
                className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? 'Saving Changes...' : 'Update Staff Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditStaffPage;
