import { Ruler, Layers, ArrowDownToLine, Settings2, Grid3X3, FolderOpen, Settings } from 'lucide-react';
import { useWallStore } from '../store/useWallStore';
import type { TabType } from '../types';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useWallStore();

  const handleTabClick = (e: React.MouseEvent, tab: TabType) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  const getTabClass = (tab: TabType) => {
    if (activeTab === tab) {
      return "text-primary font-bold border-l-4 border-primary bg-surface-container-high flex items-center px-4 py-3 gap-3 font-sans scale-[0.99] transition-transform";
    }
    return "text-slate-600 flex items-center px-4 py-3 gap-3 hover:bg-slate-50 transition-colors font-sans";
  };

  const getIconClass = (tab: TabType) => {
    if (activeTab === tab) {
      return "w-5 h-5 fill-primary/20 text-primary";
    }
    return "w-5 h-5 text-slate-500";
  };

  return (
    <nav className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col z-40 bg-surface border-r border-border-card">
      <div className="p-6 border-b border-border-card">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-2xl bg-secondary text-white flex items-center justify-center font-bold">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 font-sans leading-none">Wall Section A-1</h2>
            <p className="text-[10px] uppercase font-sans text-slate-500 mt-1 tracking-wider font-semibold">Design Phase</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        <a className={getTabClass('Geometry')} href="#" onClick={(e) => handleTabClick(e, 'Geometry')}>
          <Ruler className={getIconClass('Geometry')} />
          <span className="label-caps">Geometry</span>
        </a>
        <a className={getTabClass('Soil')} href="#" onClick={(e) => handleTabClick(e, 'Soil')}>
          <Layers className={getIconClass('Soil')} />
          <span className="label-caps">Soil Properties</span>
        </a>
        <a className={getTabClass('Loads')} href="#" onClick={(e) => handleTabClick(e, 'Loads')}>
          <ArrowDownToLine className={getIconClass('Loads')} />
          <span className="label-caps">Loads</span>
        </a>
        <a className={getTabClass('Materials')} href="#" onClick={(e) => handleTabClick(e, 'Materials')}>
          <Settings2 className={getIconClass('Materials')} />
          <span className="label-caps">Materials</span>
        </a>
        <a className={getTabClass('Reinforcement')} href="#" onClick={(e) => handleTabClick(e, 'Reinforcement')}>
          <Grid3X3 className={getIconClass('Reinforcement')} />
          <span className="label-caps">Reinforcement</span>
        </a>
      </div>
      
      <div className="border-t border-border-card py-2">
        <a className="text-slate-600 flex items-center px-4 py-3 gap-3 hover:bg-slate-50 transition-colors font-sans" href="#">
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span className="text-sm">Documentation</span>
        </a>
        <a className="text-slate-600 flex items-center px-4 py-3 gap-3 hover:bg-slate-50 transition-colors font-sans" href="#">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-sm">Support</span>
        </a>
      </div>

      <div className="p-4 mt-auto mb-4">
        <button 
          onClick={() => setActiveTab('Dashboard')}
          className="w-full bg-primary text-white py-2.5 px-4 rounded-full font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          Run Analysis
        </button>
      </div>
    </nav>
  );
};
