import { useId, useState, type ReactNode } from 'react';
import { useWallStore } from '../store/useWallStore';
import { useProjectSync } from '../contexts/ProjectSyncContext';

interface SaveProjectButtonProps {
  className: string;
  children?: ReactNode;
  idleLabel?: string;
  savingLabel?: string;
  icon?: ReactNode;
  onSaveSuccess?: () => void;
  onSaveError?: (message: string) => void;
}

export const SaveProjectButton = ({
  className,
  children,
  idleLabel = 'Save Project',
  savingLabel = 'Saving...',
  icon,
  onSaveSuccess,
  onSaveError,
}: SaveProjectButtonProps) => {
  const projectName = useWallStore((state) => state.projectName);
  const { saveCurrentProject, isSaving } = useProjectSync();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleOpen = () => {
    setDraftName(projectName);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter a project name.');
      return;
    }

    try {
      await saveCurrentProject(trimmedName);
      setIsModalOpen(false);
      setErrorMessage(null);
      onSaveSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save project.';
      setErrorMessage(message);
      onSaveError?.(message);
    }
  };

  return (
    <>
      <button onClick={handleOpen} disabled={isSaving} className={className}>
        {icon}
        {children ?? (isSaving ? savingLabel : idleLabel)}
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div
            className="absolute inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative z-10 w-full max-w-md rounded-3xl border border-border-card bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-slate-900 font-sans">
                  Save Project
                </h2>
                <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                  Enter a project name before saving to Firebase.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-wait disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <label htmlFor={titleId + '-input'} className="label-caps text-slate-500 block mb-2">
                Project Name
              </label>
              <input
                id={titleId + '-input'}
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
                disabled={isSaving}
                placeholder="Retaining wall project"
                className="w-full rounded-2xl border border-border-card px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:bg-slate-50"
              />

              {errorMessage ? (
                <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="rounded-2xl border border-border-card px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSaving ? savingLabel : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};
