import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../types';
import { getAuthErrorMessage, registerWithEmail } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: 'Engineering' as (typeof DEPARTMENTS)[number],
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateField = (field: keyof typeof formState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await registerWithEmail(
        formState.email,
        formState.password,
        formState.firstName,
        formState.lastName,
        formState.position,
        formState.department,
      );
      const profile = await refreshProfile();

      if (profile?.status === 'approved') {
        navigate('/dashboard', { replace: true });
        return;
      }

      navigate('/pending', { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl bg-surface rounded-[28px] shadow-sm border border-border-card p-8 md:p-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">Register</h1>
          <p className="text-sm text-slate-500 mt-2">
            First user becomes <span className="font-semibold text-slate-700">MasterAdmin</span>. All later accounts wait for approval.
          </p>

          <form className="mt-8 grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-caps text-slate-500 block mb-2">First Name</label>
              <input
                value={formState.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
            <div>
              <label className="label-caps text-slate-500 block mb-2">Last Name</label>
              <input
                value={formState.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
            <div>
              <label className="label-caps text-slate-500 block mb-2">Position</label>
              <input
                value={formState.position}
                onChange={(event) => updateField('position', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
            <div className="relative z-[10010]">
              <label className="label-caps text-slate-500 block mb-2">Department</label>
              <select
                value={formState.department}
                onChange={(event) => updateField('department', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-caps text-slate-500 block mb-2">Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-caps text-slate-500 block mb-2">Password</label>
              <input
                type="password"
                value={formState.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="w-full rounded-2xl border border-border-card px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
                minLength={6}
              />
            </div>

            {errorMessage ? (
              <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-primary text-white px-6 py-3 font-medium hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
