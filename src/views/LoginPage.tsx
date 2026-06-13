import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
} from '../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    if (userProfile.status === 'pending') {
      navigate('/pending', { replace: true });
      return;
    }

    if (userProfile.status === 'approved') {
      navigate(redirectTarget, { replace: true });
    }
  }, [navigate, redirectTarget, userProfile]);

  const displayErrorMessage =
    userProfile?.status === 'rejected'
      ? 'Your account request was rejected. Please contact a MasterAdmin.'
      : errorMessage;

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await loginWithEmail(email, password);
      await refreshProfile();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      await loginWithGoogle();
      await refreshProfile();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_0.85fr] bg-surface rounded-[28px] shadow-sm border border-border-card overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-blue-800 to-slate-900 text-white p-10">
          <div>
            <p className="label-caps text-white/70 mb-4">RetainCalc Pro</p>
            <h1 className="text-4xl font-bold leading-tight">Collaborative retaining wall calculations with live project control.</h1>
            <p className="text-sm text-white/80 mt-5 max-w-md leading-relaxed">
              Sign in to manage calculations, review approvals, and keep everyone working from the same engineering dataset in Firebase.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Realtime</p>
              <p className="mt-2 text-xl font-bold">Project Sync</p>
            </div>
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Secure</p>
              <p className="mt-2 text-xl font-bold">Role Access</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Login</h2>
            <p className="text-sm text-slate-500 mt-2">Enter your credentials or continue with Google.</p>

            <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label className="label-caps text-slate-500 block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label className="label-caps text-slate-500 block mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="••••••••"
                  required
                />
              </div>

              {displayErrorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {displayErrorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-primary text-white py-3 font-medium hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
              <div className="h-px flex-1 bg-border-card" />
              <span>or</span>
              <div className="h-px flex-1 bg-border-card" />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleLogin}
              className="w-full rounded-2xl border border-border-card bg-white py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}
              Continue with Google
            </button>

            <p className="text-sm text-slate-500 mt-8">
              No account yet?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-blue-800">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
