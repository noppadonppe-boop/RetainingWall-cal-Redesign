import { useState } from 'react';
import { Bell, FolderOpen, Search, Settings } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserProfileMenu } from './UserProfileMenu';
import { useProjectSync } from '../contexts/ProjectSyncContext';
import { SaveProjectButton } from './SaveProjectButton';

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-primary h-full px-1 border-b-2 border-primary'
    : 'text-slate-500 hover:text-slate-900 h-full px-1 border-b-2 border-transparent transition-colors';

export const AppShell = () => {
  const navigate = useNavigate();
  const {
    conflictMessage,
    reloadCurrentProject,
  } = useProjectSync();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-slate-800 overflow-hidden">
      <header className="h-16 bg-surface border-b border-border-card flex items-center justify-between px-6 z-50 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-8 h-full">
          <h1 className="text-xl font-bold text-primary tracking-tight">RetainCalc Pro</h1>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
            <NavLink to="/dashboard" className={navClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={navClassName}>
              Projects
            </NavLink>
            <button className="text-slate-500 hover:text-slate-900 h-full px-1 border-b-2 border-transparent transition-colors">
              Archive
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none w-48 transition-all focus:w-64"
            />
          </div>

          <button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100">
            <Settings className="w-5 h-5" />
          </button>

          <SaveProjectButton
            className="text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors hidden sm:block disabled:opacity-70 disabled:cursor-wait"
            onSaveSuccess={() => setStatusMessage('Project saved to Firebase.')}
            onSaveError={(message) => setStatusMessage(message)}
          />
          <button
            onClick={() => navigate('/projects')}
            className="bg-primary hover:bg-blue-800 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors shadow-sm hidden sm:flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Load Project
          </button>

          <UserProfileMenu />
        </div>
      </header>

      {conflictMessage || statusMessage ? (
        <div className={`px-6 py-3 text-sm border-b ${conflictMessage ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
            <span>{conflictMessage || statusMessage}</span>
            {conflictMessage ? (
              <button
                onClick={() => {
                  reloadCurrentProject().catch(() => {});
                }}
                className="px-3 py-1.5 rounded-full bg-white/80 border border-amber-200 text-amber-800 hover:bg-white"
              >
                Reload from Firebase
              </button>
            ) : (
              <button
                onClick={() => setStatusMessage(null)}
                className="px-3 py-1.5 rounded-full bg-white/80 border border-blue-200 text-blue-800 hover:bg-white"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-background md:ml-64 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
