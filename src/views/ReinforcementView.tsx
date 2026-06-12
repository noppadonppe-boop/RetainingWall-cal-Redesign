import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';
import { Download } from 'lucide-react';
import { WallGraphic } from '../components/WallGraphic';
import { StructuralDrawing } from '../components/StructuralDrawing';

export const ReinforcementView = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-8 pt-6 pb-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 font-sans">Detailed Engineering Calculation Report</h1>
          <p className="text-slate-500 text-sm font-sans">
            Project ID: PRJ-2023-RW-101 | {store.wallType} Cantilever Wall
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-800 transition-colors">
          <Download className="w-4 h-4" />
          Export to PDF
        </button>
      </div>

      {/* 1. Structural Calculation Summary */}
      <div className="bg-white border border-border-card rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-4 label-caps">1. Structural Calculation Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="text-slate-500 text-xs mb-1 font-medium">Total Wall Height (H)</div>
            <div className="text-2xl font-bold text-primary">{store.geometry.totalHeight.toFixed(2)} <span className="text-base font-normal">m</span></div>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="text-slate-500 text-xs mb-1 font-medium">Concrete Strength (fc')</div>
            <div className="text-2xl font-bold text-primary">{store.materials.concreteCompressiveStrength.toLocaleString()} <span className="text-base font-normal">kg/cm²</span></div>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="text-slate-500 text-xs mb-1 font-medium">Steel Yield Strength (fy)</div>
            <div className="text-2xl font-bold text-primary">{store.materials.steelYieldStrength.toLocaleString()} <span className="text-base font-normal">kg/cm²</span></div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Calculation Engine */}
      <div className="bg-white border border-border-card rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-6 label-caps">2. Step-by-Step Calculation Engine</h2>

        {/* Phase 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">A</div>
            <h3 className="font-bold text-slate-800 text-sm">Phase 1: Stability Analysis (การตรวจสอบความมั่นคง)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-center gap-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-slate-700">Overturning (การพลิกคว่ำ)</div>
                  <div className="text-xs text-slate-500 italic mt-1 font-serif">F.S. = M_resisting / M_overturning</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-mono text-slate-700">
                    = {results.stability.ResistingMoment.toLocaleString(undefined, {maximumFractionDigits:0})} / {results.stability.OverturningMoment.toLocaleString(undefined, {maximumFractionDigits:0})} = {results.stability.FS_overturning.toFixed(2)} {'>'} 2.0
                  </div>
                  <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${results.stability.isOverturningPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {results.stability.isOverturningPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200 w-full"></div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-slate-700">Sliding (การเลื่อนไถล)</div>
                  <div className="text-xs text-slate-500 italic mt-1 font-serif">F.S. = ΣF_resisting / ΣF_driving</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-mono text-slate-700">
                    = {(store.soilProperties.frictionCoefficient * results.loads.SigmaW).toLocaleString(undefined, {maximumFractionDigits:0})} / {results.stability.TotalHorizontalForce.toLocaleString(undefined, {maximumFractionDigits:0})} = {results.stability.FS_sliding.toFixed(2)} {'>'} 1.5
                  </div>
                  <div className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${results.stability.isSlidingPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {results.stability.isSlidingPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>

            </div>

            <div className="border border-border-card rounded-xl p-4 flex items-center justify-center bg-white h-48">
              <WallGraphic />
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">B</div>
            <h3 className="font-bold text-slate-800 text-sm">Phase 2: Structural Design - Stem (การออกแบบผนังกำแพง)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
            <div className="border border-border-card rounded-xl p-4 flex items-center justify-center bg-white min-h-[200px]">
              {/* Concept diagram for stem */}
              <div className="w-12 h-32 border-2 border-slate-700 bg-slate-100 relative">
                 <div className="absolute -bottom-2 -right-12 w-10 h-0.5 bg-red-500"></div>
                 <div className="absolute -bottom-4 -right-8 text-[10px] text-red-600 font-bold">Vu</div>
                 <div className="absolute -bottom-6 -right-12 text-[10px] text-red-600 font-bold flex items-center">
                   <svg width="20" height="10" viewBox="0 0 20 10" className="stroke-red-500 fill-none mr-1"><path d="M 2 8 C 10 0, 18 8, 18 8" markerEnd="url(#arrow)"/></svg>
                   Mu
                 </div>
              </div>
            </div>

            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-5 flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-500 mb-4 uppercase">Calculation at critical section (base of stem)</div>
              
              <div className="font-mono text-sm text-slate-800 space-y-3 mb-5">
                <div>M_u = 1.7(M_earth) + 1.7(M_surcharge) = <span className="font-bold text-slate-900">{(results.structural.stem?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</span></div>
                <div>V_u = 1.7(V_earth) + 1.7(V_surcharge) = <span className="font-bold text-slate-900">{(results.structural.stem?.V_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span></div>
              </div>

              <div className="text-sm font-bold text-slate-700 mb-2">Required Reinforcement (A_s):</div>
              <div className="font-mono text-xs text-slate-600 space-y-2">
                <div>R_n = M_u / (φ b d²) = {(results.structural.stem?.M_u ?? 0).toFixed(0)} / (0.9 × 100 × d²) = ... kg/cm²</div>
                <div>ρ_req = (0.85 fc' / fy) [ 1 - √(1 - 2 R_n / (0.85 fc')) ] = ... {'<'} ρ_max</div>
                <div className="pt-2 text-sm">
                  A_s,req = ρ b d = <span className="font-bold text-primary">{(results.structural.stem?.A_s ?? 0).toFixed(2)} cm²/m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">C</div>
            <h3 className="font-bold text-slate-800 text-sm">Phase 3: Base Slab Design (การออกแบบฐานราก)</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <div className="font-bold text-sm text-slate-700 mb-4">Heel Slab (ฐานส้นเขื่อน)</div>
              <div className="font-mono text-sm text-slate-600 space-y-2">
                <div>M_u = {(results.structural.heel?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</div>
                <div>A_s,req = <span className="font-bold text-slate-900">{(results.structural.heel?.A_s ?? 0).toFixed(2)} cm²/m</span></div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <div className="font-bold text-sm text-slate-700 mb-4">Toe Slab (ฐานหน้าเขื่อน)</div>
              <div className="font-mono text-sm text-slate-600 space-y-2">
                <div>M_u = {(results.structural.toe?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</div>
                <div>A_s,req = <span className="font-bold text-slate-900">{(results.structural.toe?.A_s ?? 0).toFixed(2)} cm²/m</span></div>
              </div>
            </div>
            <div className="border border-border-card rounded-xl flex items-center justify-center bg-white p-4">
              <div className="w-32 h-8 border-2 border-slate-700 bg-slate-100 relative mt-8">
                <div className="absolute bottom-full left-1/2 w-4 h-12 border-x-2 border-t-2 border-slate-700 bg-slate-100 -translate-x-1/2"></div>
                {/* Arrows */}
                <div className="absolute -bottom-4 left-2 text-[10px]">↑</div>
                <div className="absolute -bottom-4 left-6 text-[10px]">↑</div>
                <div className="absolute -top-4 right-2 text-[10px]">↓</div>
                <div className="absolute -top-4 right-6 text-[10px]">↓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 4 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">D</div>
            <h3 className="font-bold text-slate-800 text-sm">Phase 4: Reinforcement Selection</h3>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-border-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 text-xs label-caps border-b border-border-card">
                  <th className="py-3 px-4 font-semibold">Member Component</th>
                  <th className="py-3 px-4 font-semibold">Required A_s (cm²/m)</th>
                  <th className="py-3 px-4 font-semibold">Provided Rebar</th>
                  <th className="py-3 px-4 font-semibold">Provided A_s</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans">
                {/* Stem */}
                <tr className="border-b border-border-card hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-slate-700">Stem (Main Tension)</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{(results.structural.stem?.A_s ?? 0).toFixed(2)}</td>
                  <td className="py-4 px-4 font-mono font-bold text-primary">{results.structural.stem?.rebar?.label}</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{results.structural.stem?.rebar?.providedAs.toFixed(2)}</td>
                  <td className="py-4 px-4"><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">OK</span></td>
                </tr>
                {/* Heel */}
                {results.structural.heel && (
                  <tr className="border-b border-border-card hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-700">Heel Slab (Top)</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{results.structural.heel.A_s.toFixed(2)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-primary">{results.structural.heel.rebar?.label}</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{results.structural.heel.rebar?.providedAs.toFixed(2)}</td>
                    <td className="py-4 px-4"><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">OK</span></td>
                  </tr>
                )}
                {/* Toe */}
                {results.structural.toe && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-4 font-medium text-slate-700">Toe Slab (Bottom)</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{results.structural.toe.A_s.toFixed(2)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-primary">{results.structural.toe.rebar?.label}</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{results.structural.toe.rebar?.providedAs.toFixed(2)}</td>
                    <td className="py-4 px-4"><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">OK</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Bottom Technical Drawing Placeholder */}
      <div className="bg-white border border-border-card rounded-2xl p-6 shadow-sm mt-8">
        <StructuralDrawing />
      </div>
    </div>
  );
};
