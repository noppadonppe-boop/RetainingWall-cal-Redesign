import { useEffect, useState, type ChangeEvent } from 'react';
import { GeometryVisual } from '../components/GeometryVisual';
import { useAuth } from '../contexts/AuthContext';
import { useProjectSync } from '../contexts/ProjectSyncContext';
import { fetchUserProfile } from '../services/firebaseService';
import { useWallStore } from '../store/useWallStore';
import type { LShapeOrientation, UserProfile, WallGeometry, WallType } from '../types';
import { getWallTypeFigureLabel, getWallTypeSelectionKey } from '../utils/geometry';

const wallTypeOptions = [
  { key: 'T_SHAPE', label: 'T Shape', wallType: 'T-Shape' as WallType, hasShearKey: false },
  { key: 'T_SHAPE_SHEAR_KEY', label: 'T Shape with Shear Key', wallType: 'T-Shape' as WallType, hasShearKey: true },
  { key: 'L_SHAPE', label: 'L Shape', wallType: 'L-Shape' as WallType, hasShearKey: false },
  { key: 'L_SHAPE_SHEAR_KEY', label: 'L Shape with Shear Key', wallType: 'L-Shape' as WallType, hasShearKey: true },
];

const dimensionFields: Array<{
  name: keyof WallGeometry;
  label: string;
  disabled?: (wallType: WallType) => boolean;
}> = [
  { name: 'totalHeight', label: 'Total Height (H)' },
  { name: 'frontFillHeight', label: 'Front Back fill, h1' },
  { name: 'waterTableHeight', label: 'Under Ground water table hight, hw' },
  { name: 'topStemWidth', label: 'Top stem width, twt' },
  { name: 'bottomStemWidth', label: 'Bot. Stem width, twb' },
  { name: 'frontHeelWidth', label: 'Front heel width, Bh', disabled: (wallType) => wallType === 'L-Shape' },
  { name: 'baseWidth', label: 'Base width, B' },
  { name: 'baseThickness', label: 'Base Thickness, tb' },
];

const shearKeyFields: Array<{
  name: keyof WallGeometry;
  label: string;
}> = [
  { name: 'shearKeyDepth', label: 'Shear Key Depth, Kd' },
  { name: 'shearKeyWidth', label: 'Shear Key Width, Kt' },
];

const getProfileDisplayName = (profile: UserProfile | null) => {
  if (!profile) {
    return 'Unknown User';
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  return fullName || profile.email;
};

export const GeometryView = () => {
  const store = useWallStore();
  const { userProfile } = useAuth();
  const { currentProject } = useProjectSync();
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;

    const loadOwnerProfile = async () => {
      const ownerEmail = currentProject?.ownerEmail;

      if (!ownerEmail || ownerEmail === userProfile?.email) {
        setOwnerProfile(userProfile);
        return;
      }

      const profile = await fetchUserProfile(ownerEmail);

      if (active) {
        setOwnerProfile(profile);
      }
    };

    loadOwnerProfile().catch(() => {
      if (active) {
        setOwnerProfile(userProfile);
      }
    });

    return () => {
      active = false;
    };
  }, [currentProject?.ownerEmail, userProfile]);

  const engineerName = currentProject?.ownerEmail && !ownerProfile
    ? currentProject.ownerEmail
    : getProfileDisplayName(ownerProfile ?? userProfile);

  const selectedWallTypeKey = getWallTypeSelectionKey(store.wallType, store.hasShearKey);
  const wallTypeFigureLabel = getWallTypeFigureLabel(store.wallType, store.hasShearKey);
  const handleGeometryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    store.updateGeometry({
      [name]: value === '' ? 0 : Number.parseFloat(value) || 0,
    } as Partial<WallGeometry>);
  };

  const handleWallTypeSelection = (nextType: WallType, hasShearKey: boolean) => {
    store.setWallType(nextType);
    store.setHasShearKey(hasShearKey);
    store.setLShapeOrientation(nextType === 'L-Shape' ? 'Heel-only' : null);
  };

  const handleWallTypeDropdownChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = wallTypeOptions.find((option) => option.key === event.target.value);

    if (!selectedOption) {
      return;
    }

    handleWallTypeSelection(selectedOption.wallType, selectedOption.hasShearKey);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Geometry</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Configure wall dimensions and structure type.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface border border-border-card rounded-2xl p-6 relative overflow-hidden group focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_0_8px_rgba(30,64,175,0.1)] transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans">Configuration</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label-caps text-slate-500 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={store.projectName}
                  readOnly
                  className="w-full bg-slate-50 border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="label-caps text-slate-500 block mb-1">Engineer Name</label>
                <input
                  type="text"
                  value={engineerName}
                  readOnly
                  className="w-full bg-slate-50 border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="label-caps text-slate-500 block mb-2">Cantilever Retaining Wall Type</label>
                <select
                  value={selectedWallTypeKey}
                  onChange={handleWallTypeDropdownChange}
                  className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {wallTypeOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {store.wallType === 'L-Shape' ? (
                <div>
                  <label className="label-caps text-slate-500 block mb-1">L-Shape Orientation</label>
                  <select
                    className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={store.lShapeOrientation || 'Heel-only'}
                    onChange={(event) => store.setLShapeOrientation(event.target.value as LShapeOrientation)}
                  >
                    <option value="Heel-only">Heel-only (Soil on Heel)</option>
                    <option value="Toe-only">Toe-only (Soil on Toe)</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-surface border border-border-card rounded-2xl p-6 hover:shadow-soft-glow transition-shadow">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 font-sans">Dimensions</h2>
              <p className="text-sm text-blue-600 mt-2">For Cantilever {wallTypeFigureLabel}</p>
            </div>

            <div className="flex flex-col gap-3">
              {dimensionFields.map((field) => {
                const isDisabled = field.disabled?.(store.wallType) ?? false;

                if (isDisabled) {
                  return null;
                }

                return (
                  <div key={field.name} className="relative">
                    <label className="label-caps text-slate-500 block mb-0.5">{field.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      name={field.name}
                      className="w-full bg-surface border border-border-card rounded-2xl px-3 py-1.5 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                      value={store.geometry[field.name]}
                      onChange={handleGeometryChange}
                    />
                    <span className="absolute right-3 top-[22px] text-slate-500 text-sm">m</span>
                  </div>
                );
              })}

              {store.hasShearKey
                ? shearKeyFields.map((field) => (
                    <div key={field.name} className="relative">
                      <label className="label-caps text-slate-500 block mb-0.5">{field.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        name={field.name}
                        className="w-full bg-surface border border-border-card rounded-2xl px-3 py-1.5 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                        value={store.geometry[field.name]}
                        onChange={handleGeometryChange}
                      />
                      <span className="absolute right-3 top-[22px] text-slate-500 text-sm">m</span>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
          <GeometryVisual />
        </div>
      </div>
    </div>
  );
};
