import { useWallStore } from '../store/useWallStore';
import { DashboardView } from '../views/DashboardView';
import { GeometryView } from '../views/GeometryView';
import { LoadsView } from '../views/LoadsView';
import { MaterialsView } from '../views/MaterialsView';
import { ReinforcementView } from '../views/ReinforcementView';
import { SoilPropertiesView } from '../views/SoilPropertiesView';

export const CalculatorWorkspace = () => {
  const { activeTab } = useWallStore();

  switch (activeTab) {
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
