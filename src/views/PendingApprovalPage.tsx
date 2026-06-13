import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { userProfile, logout, refreshProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.status === 'approved') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, userProfile]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-surface border border-border-card rounded-[28px] shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <Clock3 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Approval Pending</h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Your account is signed in, but a MasterAdmin still needs to approve access before the calculator modules are unlocked.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left">
          <p className="label-caps text-slate-500">Account Status</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{userProfile?.status ?? 'pending'}</p>
          <p className="text-sm text-slate-500 mt-2">
            Email: <span className="font-medium text-slate-700">{userProfile?.email}</span>
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              refreshProfile().catch(() => {});
            }}
            className="rounded-2xl border border-border-card px-5 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Refresh Status
          </button>
          <button
            onClick={() => {
              logout().then(() => navigate('/login', { replace: true }));
            }}
            className="rounded-2xl bg-primary text-white px-5 py-3 hover:bg-blue-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
