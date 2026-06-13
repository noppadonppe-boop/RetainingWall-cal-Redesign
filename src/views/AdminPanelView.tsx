import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Shield, Users } from 'lucide-react';
import { DEPARTMENTS, USER_ROLES, type UserProfile, type UserRole, type UserStatus } from '../types';
import { subscribeUsers, updateManagedUserProfile } from '../services/firebaseService';

const RoleSelector = ({
  value,
  onChange,
}: {
  value: UserRole[];
  onChange: (roles: UserRole[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-[10010]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-xl border border-border-card px-3 py-2 text-left bg-white text-sm text-slate-700"
      >
        {value.join(', ') || 'Select roles'}
      </button>

      {open ? (
        <div className="absolute left-0 mt-2 w-full rounded-2xl border border-border-card bg-white shadow-popover p-2">
          {USER_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={value.includes(role)}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...new Set([...value, role])]);
                    return;
                  }

                  onChange(value.filter((currentRole) => currentRole !== role));
                }}
              />
              {role}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const createDraft = (user: UserProfile) => ({
  role: user.role,
  status: user.status,
  assignedProjects: user.assignedProjects.join(', '),
  department: user.department,
  position: user.position,
});

export const AdminPanelView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ReturnType<typeof createDraft>>>({});
  const [savingEmail, setSavingEmail] = useState<string | null>(null);

  useEffect(() => {
    return subscribeUsers((nextUsers) => {
      setUsers(nextUsers);
      setDrafts((current) => {
        const nextDrafts = { ...current };

        nextUsers.forEach((user) => {
          if (!nextDrafts[user.email]) {
            nextDrafts[user.email] = createDraft(user);
          }
        });

        return nextDrafts;
      });
    });
  }, []);

  const pendingCount = useMemo(
    () => users.filter((user) => user.status === 'pending').length,
    [users],
  );

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage approvals, roles, departments, and project assignments directly inside the main workspace body.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 min-w-[160px]">
            <p className="label-caps text-amber-700">Pending</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 min-w-[160px]">
            <p className="label-caps text-blue-700">Users</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{users.length}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5">
        {users.map((user) => {
          const draft = drafts[user.email] ?? createDraft(user);

          return (
            <section key={user.email} className="bg-surface border border-border-card rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                <div className="flex items-center gap-4 min-w-[280px]">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`}
                    alt={user.email}
                    className="w-16 h-16 rounded-2xl object-cover border border-border-card"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.role.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-[0.08em]"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid md:grid-cols-2 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="label-caps text-slate-500 block mb-2">Role</label>
                    <RoleSelector
                      value={draft.role}
                      onChange={(role) =>
                        setDrafts((current) => ({
                          ...current,
                          [user.email]: {
                            ...draft,
                            role,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="relative z-[10010]">
                    <label className="label-caps text-slate-500 block mb-2">Status</label>
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [user.email]: {
                            ...draft,
                            status: event.target.value as UserStatus,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-border-card px-3 py-2 bg-white text-sm text-slate-700"
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="relative z-[10010]">
                    <label className="label-caps text-slate-500 block mb-2">Department</label>
                    <select
                      value={draft.department}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [user.email]: {
                            ...draft,
                            department: event.target.value as UserProfile['department'],
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-border-card px-3 py-2 bg-white text-sm text-slate-700"
                    >
                      <option value="">Unassigned</option>
                      {DEPARTMENTS.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-caps text-slate-500 block mb-2">Position</label>
                    <input
                      value={draft.position}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [user.email]: {
                            ...draft,
                            position: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-border-card px-3 py-2 text-sm text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="label-caps text-slate-500 block mb-2">Assigned Projects</label>
                    <input
                      value={draft.assignedProjects}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [user.email]: {
                            ...draft,
                            assignedProjects: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-border-card px-3 py-2 text-sm text-slate-700"
                      placeholder="project-id-1, project-id-2"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-card pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    First user: {user.isFirstUser ? 'Yes' : 'No'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    UID: {user.uid}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    setSavingEmail(user.email);

                    try {
                      await updateManagedUserProfile(user.email, {
                        role: draft.role,
                        status: draft.status,
                        department: draft.department,
                        position: draft.position,
                        assignedProjects: draft.assignedProjects
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      });
                    } finally {
                      setSavingEmail(null);
                    }
                  }}
                  disabled={savingEmail === user.email}
                  className="px-4 py-2 rounded-2xl bg-primary text-white hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-wait inline-flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  {savingEmail === user.email ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
