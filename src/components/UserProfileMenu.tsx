import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Save } from 'lucide-react';
import { DEPARTMENTS } from '../types';
import { useAuth } from '../contexts/AuthContext';

const getAvatarFallback = (firstName?: string, lastName?: string, email?: string) => {
  const label = `${firstName ?? ''} ${lastName ?? ''}`.trim() || email || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=e2e8f0&color=0f172a`;
};

export const UserProfileMenu = () => {
  const { userProfile, updateCurrentUserProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    firstName: userProfile?.firstName ?? '',
    lastName: userProfile?.lastName ?? '',
    position: userProfile?.position ?? '',
    department: userProfile?.department ?? '',
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userProfile) {
    return null;
  }

  return (
    <div className="relative z-[10010]" ref={containerRef}>
      <button
        onClick={() => {
          if (!open) {
            setFormState({
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              position: userProfile.position,
              department: userProfile.department,
            });
          }

          setOpen((current) => !current);
        }}
        className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
      >
        <img
          src={userProfile.photoURL || getAvatarFallback(userProfile.firstName, userProfile.lastName, userProfile.email)}
          alt={userProfile.email}
          className="w-9 h-9 rounded-full object-cover border border-slate-300"
        />
        <div className="hidden xl:block text-left">
          <div className="text-sm font-semibold text-slate-800 leading-tight">
            {userProfile.firstName} {userProfile.lastName}
          </div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
            {userProfile.role.join(', ')}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[360px] rounded-3xl border border-border-card bg-white shadow-popover overflow-hidden">
          <div className="px-5 py-4 border-b border-border-card flex items-center gap-4">
            <img
              src={userProfile.photoURL || getAvatarFallback(userProfile.firstName, userProfile.lastName, userProfile.email)}
              alt={userProfile.email}
              className="w-14 h-14 rounded-2xl object-cover border border-border-card"
            />
            <div>
              <h3 className="font-semibold text-slate-900">
                {userProfile.firstName} {userProfile.lastName}
              </h3>
              <p className="text-sm text-slate-500">{userProfile.email}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-caps text-slate-500 block mb-2">First Name</label>
                <input
                  value={formState.firstName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="label-caps text-slate-500 block mb-2">Last Name</label>
                <input
                  value={formState.lastName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="label-caps text-slate-500 block mb-2">Position</label>
              <input
                value={formState.position}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    position: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-border-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="relative z-[10010]">
              <label className="label-caps text-slate-500 block mb-2">Department</label>
              <select
                value={formState.department}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    department: event.target.value as (typeof DEPARTMENTS)[number] | '',
                  }))
                }
                className="w-full rounded-2xl border border-border-card px-3 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Unassigned</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border-card flex items-center justify-between gap-3">
            <button
              onClick={async () => {
                await logout();
              }}
              className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              onClick={async () => {
                setSaving(true);

                try {
                  await updateCurrentUserProfile(formState);
                  setOpen(false);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
