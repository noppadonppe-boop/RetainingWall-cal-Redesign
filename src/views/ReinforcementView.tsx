import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';
import { Download } from 'lucide-react';
import { StructuralDrawing } from '../components/StructuralDrawing';

export const ReinforcementView = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-8 pt-6 pb-20 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#334155] mb-1 font-sans">Detailed Engineering Calculation Report</h1>
          <p className="text-[#64748b] text-sm font-sans">
            Project ID: PRJ-2023-RW-101 | {store.wallType} Cantilever Wall
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg shadow-sm hover:bg-[#1d4ed8] transition-colors">
          <Download className="w-4 h-4" />
          Export to PDF
        </button>
      </div>

      {/* 1. Structural Calculation Summary */}
      <div className="border border-[#e2e8f0] rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-[#334155] mb-4">1. Structural Calculation Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
            <div className="text-[#64748b] text-xs mb-2 font-medium">Total Wall Height (H)</div>
            <div className="text-2xl font-bold text-[#2563eb]">{store.geometry.totalHeight.toFixed(2)} <span className="text-base font-normal">m</span></div>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
            <div className="text-[#64748b] text-xs mb-2 font-medium">Concrete Strength (fc')</div>
            <div className="text-2xl font-bold text-[#2563eb]">{store.materials.concreteCompressiveStrength.toLocaleString()} <span className="text-base font-normal">kg/cm²</span></div>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
            <div className="text-[#64748b] text-xs mb-2 font-medium">Steel Yield Strength (fy)</div>
            <div className="text-2xl font-bold text-[#2563eb]">{store.materials.steelYieldStrength.toLocaleString()} <span className="text-base font-normal">kg/cm²</span></div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Calculation Engine */}
      <div className="border border-[#e2e8f0] rounded-2xl p-8 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-[#334155] mb-8">2. Step-by-Step Calculation Engine</h2>

        {/* Phase 1 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold shrink-0">A</div>
            <h3 className="font-bold text-[#334155] text-[15px]">Phase 1: Stability Analysis (การตรวจสอบความมั่นคง)</h3>
          </div>
          
          <div className="grid grid-cols-[1fr_1fr] gap-6">
            <div className="bg-[#e0e7ff] rounded-xl p-8 flex flex-col justify-center gap-8 shadow-sm">
              
              <div className="flex flex-col relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[13px] text-[#1e293b]">Overturning (การพลิกคว่ำ)</div>
                    <div className="text-xs text-[#475569] italic mt-1 font-serif">F.S. = M_stabilizing / M_overturning</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-mono text-[#334155]">
                      = {results.stability.ResistingMoment.toLocaleString(undefined, {maximumFractionDigits:1})} / {results.stability.OverturningMoment.toLocaleString(undefined, {maximumFractionDigits:1})} = {results.stability.FS_overturning.toFixed(2)} {'>'} 2.0
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0">
                  <div className={`px-4 py-1 rounded-full text-xs font-bold ${results.stability.isOverturningPass ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                    {results.stability.isOverturningPass ? 'Pass' : 'Fail'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[13px] text-[#1e293b]">Sliding (การเลื่อนไถล)</div>
                    <div className="text-xs text-[#475569] italic mt-1 font-serif">F.S. = ΣF_resisting / ΣF_driving</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-mono text-[#334155]">
                      = {(store.soilProperties.frictionCoefficient * results.loads.SigmaW).toLocaleString(undefined, {maximumFractionDigits:0})} / {results.stability.TotalHorizontalForce.toLocaleString(undefined, {maximumFractionDigits:0})} = {results.stability.FS_sliding.toFixed(2)} {'>'} 1.5
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0">
                  <div className={`px-4 py-1 rounded-full text-xs font-bold ${results.stability.isSlidingPass ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                    {results.stability.isSlidingPass ? 'Pass' : 'Fail'}
                  </div>
                </div>
              </div>

            </div>

            <div className="border border-[#e2e8f0] rounded-xl flex items-center justify-center bg-white p-6 shadow-sm min-h-[250px]">
              {/* Custom SVG for Phase 1 */}
              <svg viewBox="0 0 300 200" className="w-full h-full max-w-[280px]">
                <defs>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-purple-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 10 L 5 0 L 10 10 z" fill="#a855f7" />
                  </marker>
                </defs>
                {/* Wall */}
                <path d="M 100 150 L 180 150 L 180 135 L 135 135 L 135 40 L 115 40 L 115 135 L 100 135 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                {/* Backfill line */}
                <line x1="180" y1="50" x2="220" y2="50" stroke="#94a3b8" strokeDasharray="4 2" />
                {/* Front ground line */}
                <line x1="80" y1="135" x2="100" y2="135" stroke="#94a3b8" strokeDasharray="4 2" />
                {/* Active Earth Pressure Triangle */}
                <polygon points="180,50 180,150 220,150" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
                <line x1="180" y1="80" x2="190" y2="80" stroke="#3b82f6" markerEnd="url(#arrow-blue)" />
                <line x1="180" y1="110" x2="205" y2="110" stroke="#3b82f6" markerEnd="url(#arrow-blue)" />
                <line x1="180" y1="140" x2="215" y2="140" stroke="#3b82f6" markerEnd="url(#arrow-blue)" />
                <text x="230" y="130" className="text-[10px] font-sans text-[#334155]">Pa</text>
                {/* Bearing Pressure */}
                <polygon points="100,150 180,150 180,165 100,175" fill="#faf5ff" stroke="#a855f7" strokeWidth="1" />
                <line x1="105" y1="170" x2="105" y2="155" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="140" y1="165" x2="140" y2="155" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="175" y1="160" x2="175" y2="155" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <text x="100" y="190" className="text-[9px] font-sans text-[#334155]">q_max</text>
                <text x="170" y="190" className="text-[9px] font-sans text-[#334155]">q_min</text>
              </svg>
            </div>
          </div>
          
          <div className="w-full h-px bg-[#f1f5f9] mt-12"></div>
        </div>

        {/* Phase 2 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold shrink-0">B</div>
            <h3 className="font-bold text-[#334155] text-[15px]">Phase 2: Structural Design - Stem (การออกแบบตัวกำแพง)</h3>
          </div>
          
          <div className="grid grid-cols-[1fr_1.5fr] gap-6">
            <div className="border border-[#e2e8f0] rounded-xl flex items-center justify-center bg-white p-6 shadow-sm min-h-[250px]">
              {/* Custom SVG for Phase 2 */}
              <svg viewBox="0 0 200 200" className="w-full h-full max-w-[180px]">
                <defs>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>
                {/* Stem */}
                <rect x="80" y="40" width="25" height="110" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
                {/* Critical Section Line */}
                <line x1="60" y1="150" x2="120" y2="150" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="105" y="160" className="text-[8px] font-sans font-bold text-[#ef4444]">Critical Section</text>
                {/* Forces */}
                <line x1="105" y1="130" x2="140" y2="130" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
                <text x="145" y="132" className="text-[10px] font-sans font-bold text-[#ef4444]">Vu</text>
                
                <path d="M 105 145 C 120 145, 120 135, 115 135" fill="none" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow-red)" />
                <text x="125" y="145" className="text-[10px] font-sans font-bold text-[#ef4444]">Mu</text>
              </svg>
            </div>

            <div className="bg-[#e0e7ff] rounded-xl p-6 flex flex-col justify-center shadow-sm">
              <div className="text-[13px] font-medium text-[#475569] mb-4 italic font-serif">Calculation at critical section (base of stem)</div>
              
              <div className="font-mono text-[13px] text-[#334155] space-y-3 mb-6">
                <div>M_u = 1.7(M_earth) + 1.7(M_surcharge) = <span className="font-bold text-[#0f172a]">{(results.structural.stem?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</span></div>
                <div>V_u = 1.7(V_earth) + 1.7(V_surcharge) = <span className="font-bold text-[#0f172a]">{(results.structural.stem?.V_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span></div>
              </div>

              <div className="text-[13px] font-bold text-[#1e293b] mb-3">Required Reinforcement (A_s):</div>
              <div className="font-mono text-[12px] text-[#475569] space-y-2">
                <div>R_n = M_u / (φ b d²) = {(results.structural.stem?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} / (0.9 × 100 × d²) = {((results.structural.stem?.M_u ?? 0) / (0.9 * 100 * Math.pow(((store.geometry.stemThickness*100)-5)/10, 2))).toFixed(2)} kg/cm²</div>
                <div>ρ_req = (0.85 fc' / fy) [ 1 - √(1 - 2 R_n / (0.85 fc')) ] = ... {'<'} ρ_max</div>
                <div className="pt-2">
                  A_s,req = ρ b d = <span className="font-bold text-[#2563eb] text-[14px]">{(results.structural.stem?.A_s ?? 0).toFixed(2)} cm²/m</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-[#f1f5f9] mt-12"></div>
        </div>

        {/* Phase 3 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold shrink-0">C</div>
            <h3 className="font-bold text-[#334155] text-[15px]">Phase 3: Base Slab Design (การออกแบบฐานราก)</h3>
          </div>
          
          <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-6">
            <div className="bg-[#e0e7ff] rounded-xl p-6 shadow-sm flex flex-col justify-center">
              <div className="font-bold text-[14px] text-[#1e293b] mb-6">Heel Slab (ฐานส้นเขื่อน)</div>
              <div className="font-mono text-[13px] text-[#334155] space-y-3">
                <div>M_u = {(results.structural.heel?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</div>
                <div>A_s,req = {(results.structural.heel?.A_s ?? 0).toFixed(2)} cm²/m</div>
              </div>
            </div>
            <div className="bg-[#e0e7ff] rounded-xl p-6 shadow-sm flex flex-col justify-center">
              <div className="font-bold text-[14px] text-[#1e293b] mb-6">Toe Slab (ฐานหน้าเขื่อน)</div>
              <div className="font-mono text-[13px] text-[#334155] space-y-3">
                <div>M_u = {(results.structural.toe?.M_u ?? 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg-m</div>
                <div>A_s,req = {(results.structural.toe?.A_s ?? 0).toFixed(2)} cm²/m</div>
              </div>
            </div>
            <div className="border border-[#e2e8f0] rounded-xl flex items-center justify-center bg-white p-6 shadow-sm min-h-[200px]">
               {/* Custom SVG for Phase 3 */}
               <svg viewBox="0 0 250 150" className="w-full h-full max-w-[220px]">
                <defs>
                  <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 10 L 5 0 L 10 10 z" fill="#64748b" />
                  </marker>
                </defs>
                {/* Base Slab */}
                <rect x="40" y="80" width="160" height="15" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
                {/* Stem stub */}
                <rect x="90" y="50" width="20" height="30" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
                
                {/* Labels */}
                <text x="60" y="75" className="text-[9px] font-sans text-[#334155]">Toe</text>
                <text x="160" y="75" className="text-[9px] font-sans text-[#334155]">Heel</text>

                {/* Pressure block */}
                <rect x="40" y="95" width="160" height="20" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 2" />
                {/* Upward arrows */}
                <line x1="50" y1="115" x2="50" y2="95" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="80" y1="110" x2="80" y2="95" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="120" y1="105" x2="120" y2="95" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="160" y1="100" x2="160" y2="95" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />
                <line x1="190" y1="95" x2="190" y2="95" stroke="#a855f7" markerStart="url(#arrow-purple-up)" />

                {/* Downward loads */}
                <line x1="100" y1="30" x2="100" y2="50" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-up)" transform="scale(1,-1) translate(0,-80)" />
                <line x1="140" y1="50" x2="140" y2="80" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-up)" transform="scale(1,-1) translate(0,-130)" />
                <line x1="180" y1="50" x2="180" y2="80" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-up)" transform="scale(1,-1) translate(0,-130)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Structural Drawing Module */}
      <StructuralDrawing />
      
    </div>
  );
};
