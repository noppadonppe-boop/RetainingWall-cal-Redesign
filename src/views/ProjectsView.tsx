import { useMemo } from 'react';
import { FolderOpen, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectSync } from '../contexts/ProjectSyncContext';

const formatTimestamp = (value: { toDate?: () => Date } | null | undefined) => {
  if (!value?.toDate) {
    return 'Pending sync';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value.toDate());
};

export const ProjectsView = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const {
    projects,
    projectsLoading,
    currentProjectId,
    saveCurrentProject,
    loadProject,
    deleteProject,
    startNewProject,
    isSaving,
  } = useProjectSync();

  const myRoleLabel = useMemo(() => userProfile?.role.join(', ') ?? 'User', [userProfile]);

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">My Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Shared Firebase project registry under a single workspace. Current access: {myRoleLabel}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              startNewProject();
              navigate('/dashboard');
            }}
            className="px-5 py-3 rounded-2xl border border-border-card text-slate-700 hover:bg-slate-50 transition-colors"
          >
            New Blank Project
          </button>
          <button
            onClick={() => saveCurrentProject()}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-primary text-white hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-wait"
          >
            {isSaving ? 'Saving...' : 'Save Current Project'}
          </button>
        </div>
      </header>

      <div className="bg-surface border border-border-card rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.7fr_1fr_1fr_0.8fr] gap-4 px-6 py-4 border-b border-border-card bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">
          <div>Project</div>
          <div>Owner</div>
          <div>Updated</div>
          <div className="text-right">Actions</div>
        </div>

        {projectsLoading ? (
          <div className="px-6 py-10 text-sm text-slate-500">Loading projects from Firebase...</div>
        ) : null}

        {!projectsLoading && projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-medium">No saved projects yet.</p>
            <p className="text-sm text-slate-500 mt-1">Create or save a calculation to start the shared project list.</p>
          </div>
        ) : null}

        {!projectsLoading &&
          projects.map((project) => {
            const canDelete =
              userProfile?.role.includes('MasterAdmin') || userProfile?.email === project.ownerEmail;

            return (
              <div
                key={project.id}
                className={`grid grid-cols-[1.7fr_1fr_1fr_0.8fr] gap-4 px-6 py-5 border-b border-border-card items-center ${
                  currentProjectId === project.id ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{project.projectName}</h3>
                    {currentProjectId === project.id ? (
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.08em]">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Version {project.version} · Last edited by {project.lastEditedByEmail}
                  </p>
                </div>
                <div className="text-sm text-slate-700">{project.ownerEmail}</div>
                <div className="text-sm text-slate-500">{formatTimestamp(project.updatedAt)}</div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      await loadProject(project.id);
                      navigate('/dashboard');
                    }}
                    className="px-3 py-2 rounded-xl border border-border-card text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Load
                  </button>
                  {canDelete ? (
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete "${project.projectName}"?`)) {
                          return;
                        }

                        await deleteProject(project.id);
                      }}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
