import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';
import { CheckCircle, Calculator, FileText, CloudUpload } from 'lucide-react';
import { WallGraphic } from '../components/WallGraphic';

export const DashboardView = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  const { stability, structural } = results;

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Calculation Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Final comprehensive structural and stability analysis.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Graphic Overview */}
        <div className="xl:col-span-5 flex flex-col gap-8">
          <WallGraphic />
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border-card">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Stability Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overturning */}
              <div className="bg-white border border-border-card rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">Overturning</h4>
                  {stability.FS_overturning >= 2.0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-green-100/50 text-green-700 label-caps">PASS</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-red-100/50 text-red-700 label-caps">FAIL</span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold font-mono ${stability.FS_overturning >= 2.0 ? 'text-primary' : 'text-error'}`}>
                      {stability.FS_overturning.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 mb-1">F.S.</span>
                  </div>
                  <p className="label-caps text-slate-400 mt-1">Req: &gt; 2.0</p>
                </div>
              </div>

              {/* Sliding */}
              <div className="bg-white border border-border-card rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">Sliding</h4>
                  {stability.FS_sliding >= 1.5 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-green-100/50 text-green-700 label-caps">PASS</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-red-100/50 text-red-700 label-caps">FAIL</span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold font-mono ${stability.FS_sliding >= 1.5 ? 'text-primary' : 'text-error'}`}>
                      {stability.FS_sliding.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 mb-1">F.S.</span>
                  </div>
                  <p className="label-caps text-slate-400 mt-1">Req: &gt; 1.5</p>
                </div>
              </div>

              {/* Bearing Pressure */}
              <div className="bg-white border border-border-card rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">Bearing Pressure</h4>
                  {stability.f_max <= store.soilProperties.allowableBearingPressure ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-green-100/50 text-green-700 label-caps">PASS</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl bg-red-100/50 text-red-700 label-caps">FAIL</span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold font-mono ${stability.f_max <= store.soilProperties.allowableBearingPressure ? 'text-primary' : 'text-error'}`}>
                      {stability.f_max.toFixed(0)}
                    </span>
                    <span className="text-sm text-slate-500 mb-1">kg/m²</span>
                  </div>
                  <p className="label-caps text-slate-400 mt-1">Allowable: {store.soilProperties.allowableBearingPressure} kg/m²</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-border-card overflow-hidden">
            <div className="p-5 border-b border-border-card bg-surface">
              <h3 className="text-xl font-bold text-slate-800 font-sans">Structural Design Summaries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border-card">
                    <th className="py-3 px-5 label-caps text-slate-500">Component</th>
                    <th className="py-3 px-5 label-caps text-slate-500 text-right">Ult. Moment (Mu)</th>
                    <th className="py-3 px-5 label-caps text-slate-500 text-right">Ult. Shear (Vu)</th>
                    <th className="py-3 px-5 label-caps text-slate-500 text-right">Req. Steel (As)</th>
                    <th className="py-3 px-5 label-caps text-slate-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm text-slate-800">
                  <tr className="border-b border-border-card hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-sans font-medium">Stem (Base)</td>
                    <td className="py-3 px-5 text-right">{(structural.stem?.M_u ?? 0).toFixed(0)} kg-m</td>
                    <td className="py-3 px-5 text-right">{(structural.stem?.V_u ?? 0).toFixed(0)} kg</td>
                    <td className="py-3 px-5 text-right text-primary font-bold">{(structural.stem?.A_s ?? 0).toFixed(2)} cm²/m</td>
                    <td className="py-3 px-5 text-center">
                      <CheckCircle className="w-5 h-5 text-green-500 inline-block" />
                    </td>
                  </tr>
                  {store.wallType !== 'L-Shape' || store.lShapeOrientation !== 'Heel-only' ? (
                    <tr className="border-b border-border-card hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 font-sans font-medium">Toe Slab</td>
                      <td className="py-3 px-5 text-right">{(structural.toe?.M_u ?? 0).toFixed(0)} kg-m</td>
                      <td className="py-3 px-5 text-right">{(structural.toe?.V_u ?? 0).toFixed(0)} kg</td>
                      <td className="py-3 px-5 text-right text-primary font-bold">{(structural.toe?.A_s ?? 0).toFixed(2)} cm²/m</td>
                      <td className="py-3 px-5 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 inline-block" />
                      </td>
                    </tr>
                  ) : null}
                  {store.wallType !== 'L-Shape' || store.lShapeOrientation !== 'Toe-only' ? (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 font-sans font-medium">Heel Slab</td>
                      <td className="py-3 px-5 text-right">{(structural.heel?.M_u ?? 0).toFixed(0)} kg-m</td>
                      <td className="py-3 px-5 text-right">{(structural.heel?.V_u ?? 0).toFixed(0)} kg</td>
                      <td className="py-3 px-5 text-right text-primary font-bold">{(structural.heel?.A_s ?? 0).toFixed(2)} cm²/m</td>
                      <td className="py-3 px-5 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 inline-block" />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-2 mb-8">
            <button className="flex items-center gap-2 px-6 py-3 border border-border-card text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors label-caps shadow-sm bg-white">
              <CloudUpload className="w-5 h-5 text-slate-500" />
              Save to Cloud
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-colors label-caps shadow-sm">
              <FileText className="w-5 h-5 text-white/80" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
