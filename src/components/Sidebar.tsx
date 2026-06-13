import {
  ArrowDownToLine,
  FolderOpen,
  Grid3X3,
  Layers,
  Ruler,
  Settings,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallStore } from '../store/useWallStore';
import type { TabType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProjectSync } from '../contexts/ProjectSyncContext';

const getAvatarFallback = (label: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=1e40af&color=ffffff`;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTab, setActiveTab, projectName } = useWallStore();
  const { userProfile, pendingUsersCount } = useAuth();
  const { currentProjectId } = useProjectSync();

  const handleTabClick = (event: React.MouseEvent, tab: TabType) => {
    event.preventDefault();
    setActiveTab(tab);
    navigate('/dashboard');
  };

  const isDashboardRoute = location.pathname === '/dashboard';

  const getTabClass = (tab: TabType) => {
    if (isDashboardRoute && activeTab === tab) {
      return 'text-primary font-bold border-l-4 border-primary bg-surface-container-high flex items-center px-4 py-3 gap-3 font-sans scale-[0.99] transition-transform';
    }

    return 'text-slate-600 flex items-center px-4 py-3 gap-3 hover:bg-slate-50 transition-colors font-sans';
  };

  const getIconClass = (tab: TabType) => {
    if (isDashboardRoute && activeTab === tab) {
      return 'w-5 h-5 fill-primary/20 text-primary';
    }

    return 'w-5 h-5 text-slate-500';
  };

  return (
    <nav className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col z-40 bg-surface border-r border-border-card">
      <div className="p-4 border-b border-border-card">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-blue-800 text-white p-4">
          <div className="flex items-center gap-3">
            <img
              src={
                userProfile?.photoURL ||
                getAvatarFallback(`${userProfile?.firstName ?? 'RetainCalc'} ${userProfile?.lastName ?? 'User'}`)
              }
              alt={userProfile?.email ?? 'user'}
              className="w-12 h-12 rounded-2xl object-cover border border-white/20"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold leading-none truncate">
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Workspace User'}
              </h2>
              <p className="text-[10px] uppercase text-white/70 mt-1 tracking-wider font-semibold truncate">
                {userProfile?.role.join(', ') || 'Awaiting profile'}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/60">Current Project</p>
            <p className="text-sm font-semibold mt-1 truncate">{projectName}</p>
            <p className="text-[11px] text-white/70 mt-1">
              {currentProjectId ? `Linked to Firebase ID ${currentProjectId}` : 'Unsaved local draft'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        <a className={getTabClass('Geometry')} href="#" onClick={(event) => handleTabClick(event, 'Geometry')}>
          <Ruler className={getIconClass('Geometry')} />
          <span className="label-caps">Geometry</span>
        </a>
        <a className={getTabClass('Soil')} href="#" onClick={(event) => handleTabClick(event, 'Soil')}>
          <Layers className={getIconClass('Soil')} />
          <span className="label-caps">Soil Properties</span>
        </a>
        <a className={getTabClass('Loads')} href="#" onClick={(event) => handleTabClick(event, 'Loads')}>
          <ArrowDownToLine className={getIconClass('Loads')} />
          <span className="label-caps">Loads</span>
        </a>
        <a className={getTabClass('Materials')} href="#" onClick={(event) => handleTabClick(event, 'Materials')}>
          <Settings2 className={getIconClass('Materials')} />
          <span className="label-caps">Materials</span>
        </a>
        <a className={getTabClass('Reinforcement')} href="#" onClick={(event) => handleTabClick(event, 'Reinforcement')}>
          <Grid3X3 className={getIconClass('Reinforcement')} />
          <span className="label-caps">Reinforcement</span>
        </a>
      </div>

      <div className="border-t border-border-card py-2">
        <button
          onClick={() => navigate('/projects')}
          className={`w-full text-left flex items-center px-4 py-3 gap-3 transition-colors font-sans ${
            location.pathname === '/projects' ? 'text-primary bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span className="text-sm">My Projects</span>
        </button>
        {userProfile?.role.includes('MasterAdmin') ? (
          <button
            onClick={() => navigate('/admin')}
            className={`w-full text-left flex items-center justify-between px-4 py-3 gap-3 transition-colors font-sans ${
              location.pathname === '/admin' ? 'text-primary bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span className="text-sm">Manage Users</span>
            </span>
            {pendingUsersCount > 0 ? (
              <span className="min-w-6 h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                {pendingUsersCount}
              </span>
            ) : null}
          </button>
        ) : null}
        <a className="text-slate-600 flex items-center px-4 py-3 gap-3 hover:bg-slate-50 transition-colors font-sans" href="#">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-sm">Support</span>
        </a>
      </div>

      <div className="p-4 mt-auto mb-4">
        <button
          onClick={() => {
            setActiveTab('Dashboard');
            navigate('/dashboard');
          }}
          className="w-full bg-primary text-white py-2.5 px-4 rounded-full font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          Run Analysis
        </button>
      </div>
    </nav>
  );
};
