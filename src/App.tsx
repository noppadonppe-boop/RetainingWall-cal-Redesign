import { useWallStore } from './store/useWallStore';
import { Sidebar } from './components/Sidebar';
import { Search, Bell, Settings } from 'lucide-react';

// Views
import { GeometryView } from './views/GeometryView';
import { SoilPropertiesView } from './views/SoilPropertiesView';
import { LoadsView } from './views/LoadsView';
import { MaterialsView } from './views/MaterialsView';
import { ReinforcementView } from './views/ReinforcementView';
import { DashboardView } from './views/DashboardView';

function App() {
  const store = useWallStore();

  const renderActiveView = () => {
    switch (store.activeTab) {
      case 'Geometry':
        return <GeometryView />;
      case 'Soil':
        return <SoilPropertiesView />;
      case 'Loads':
        return <LoadsView />;
      case 'Materials':
        return <MaterialsView />;
      case 'Reinforcement':
        return <ReinforcementView />;
      case 'Dashboard':
        return <DashboardView />;
      default:
        return <GeometryView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-slate-800 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-surface border-b border-border-card flex items-center justify-between px-6 z-50 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-8 h-full">
          <h1 className="text-xl font-bold text-primary tracking-tight">RetainCalc Pro</h1>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
            <button className="text-slate-500 hover:text-slate-900 h-full px-1 border-b-2 border-transparent transition-colors">Dashboard</button>
            <button className="text-primary h-full px-1 border-b-2 border-primary">Projects</button>
            <button className="text-slate-500 hover:text-slate-900 h-full px-1 border-b-2 border-transparent transition-colors">Archive</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none w-48 transition-all focus:w-64" />
          </div>
          
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 mx-1">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          <button className="text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
            Save
          </button>
          <button className="bg-primary hover:bg-blue-800 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors shadow-sm hidden sm:block">
            Export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background md:ml-64 relative">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
