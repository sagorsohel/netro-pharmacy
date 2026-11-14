import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  useGetPharmacyStaffQuery,
  useUpdateStaffMutation,
  useResetStaffPasswordMutation,
  useDeleteStaffMutation,
  type PharmacyRole,
} from '../../store/api/staffApi';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Clock,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ROLE_COLORS: Record<PharmacyRole, { bg: string; text: string; border: string }> = {
  owner: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  manager: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  pharmacist: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cashier: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  staff: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const StaffPage: React.FC = () => {
  const { pharmacy } = useAppSelector((state) => state.auth);
  const pharmacyId = pharmacy?.id || 1001;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | PharmacyRole>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: response, isLoading } = useGetPharmacyStaffQuery({
    pharmacyId,
    search: search.trim() || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
  });

  const [updateStaff] = useUpdateStaffMutation();
  const [resetPassword] = useResetStaffPasswordMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const staffList = response?.data || [];

  const handleToggleStatus = async (user: any) => {
    try {
      await updateStaff({
        pharmacyId,
        userId: user.id,
        data: { isActive: !user.isActive },
      }).unwrap();

      setNotification({
        type: 'success',
        message: `${user.name} is now ${!user.isActive ? 'Active' : 'Inactive'}.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to update staff status.',
      });
    }
  };

  const handleResetPassword = async (user: any) => {
    const newPass = prompt(`Enter new password for ${user.name} (minimum 6 characters):`);
    if (!newPass || newPass.length < 6) {
      if (newPass !== null) alert('Password must be at least 6 characters.');
      return;
    }

    try {
      await resetPassword({
        pharmacyId,
        userId: user.id,
        newPassword: newPass.trim(),
      }).unwrap();

      setNotification({
        type: 'success',
        message: `Password reset successfully for ${user.name}.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to reset password.',
      });
    }
  };

  const handleDelete = async (user: any) => {
    if (!window.confirm(`Are you sure you want to remove ${user.name} from Pharmacy #${pharmacyId}?`)) {
      return;
    }

    try {
      await deleteStaff({ pharmacyId, userId: user.id }).unwrap();
      setNotification({
        type: 'success',
        message: `${user.name} has been removed.`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.data?.message || 'Failed to remove staff member.',
      });
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-dark flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Branch Staff Directory</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {staffList.length} Team Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmacy branch personnel, roles (Manager, Pharmacist, Cashier), credentials and account permissions.
          </p>
        </div>

        <Link
          to="/staff/new"
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Staff</span>
        </Link>
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

      {/* 2. Search & Role Filter Tabs */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or phone..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(
            [
              { id: 'all', label: 'All Staff' },
              { id: 'owner', label: 'Owners' },
              { id: 'manager', label: 'Managers' },
              { id: 'pharmacist', label: 'Pharmacists' },
              { id: 'cashier', label: 'Cashiers' },
              { id: 'staff', label: 'General' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading branch staff...</div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-dark text-sm">No staff members found</p>
            <p className="text-slate-400 text-xs">
              Click "Add New Staff" to provision team member accounts for this branch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role / Designation</th>
                  <th className="py-3 px-4">Contact Phone (Login ID)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => {
                  const roleStyle = ROLE_COLORS[st.role] || ROLE_COLORS.staff;
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-xs ring-1 ring-emerald-500/20">
                            {st.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-dark text-xs">{st.name}</span>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {st.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {st.role}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono font-medium text-dark">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{st.phone}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-500">
                        {st.email || <span className="text-slate-300">-</span>}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {st.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-300" />
                            <span>{new Date(st.lastLoginAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span>Never logged in</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            st.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/staff/edit/${st.id}`}
                            title="Edit Staff Details"
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleResetPassword(st)}
                            title="Reset Staff Password"
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-600 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(st)}
                            title="Remove Staff"
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage;
