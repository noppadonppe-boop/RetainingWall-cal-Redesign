import type { WallState } from '../types';

export const CONCRETE_UNIT_WEIGHT = 2400; // kg/m3

export interface RebarSelection {
  barSize: number;
  spacing: number;
  providedAs: number;
  label: string;
}

export function selectRebar(requiredAs: number, minSpacing = 10, maxSpacing = 30): RebarSelection {
  const bars = [12, 16, 20, 25];
  const spacings = [10, 12.5, 15, 17.5, 20, 25, 30];
  
  let best: RebarSelection | null = null;
  let minDiff = Infinity;
  
  for (const bar of bars) {
    const area = (Math.PI * Math.pow(bar/10, 2)) / 4; // cm2 per bar
    for (const s of spacings) {
      if (s < minSpacing || s > maxSpacing) continue;
      const providedAs = (area * 100) / s;
      if (providedAs >= requiredAs) {
        const diff = providedAs - requiredAs;
        if (diff < minDiff) {
          minDiff = diff;
          best = {
            barSize: bar,
            spacing: s,
            providedAs,
            label: `DB${bar} @ ${s} cm c/c`
          };
        }
      }
    }
  }
  
  if (!best) {
    // Default to largest bar if required As is very large
    const bar = 25;
    const area = (Math.PI * Math.pow(bar/10, 2)) / 4;
    return {
      barSize: bar,
      spacing: 10,
      providedAs: (area * 100) / 10,
      label: `DB25 @ 10 cm c/c`
    };
  }
  
  return best;
}

export function runCalculations(state: WallState) {
  const { geometry, soilProperties, loads, materials, wallType, lShapeOrientation } = state;
  const H = geometry.totalHeight;
  const baseThickness = geometry.baseThickness || 0.4;
  const stemHeight = H - baseThickness;
  
  // Adjusted widths based on wall type
  let toe = geometry.toeWidth;
  let heel = geometry.heelWidth;
  
  if (wallType === 'L-Shape') {
    if (lShapeOrientation === 'Heel-only') {
      toe = 0;
    } else if (lShapeOrientation === 'Toe-only') {
      heel = 0;
    }
  }
  
  const actualBaseWidth = toe + geometry.stemThickness + heel;
  
  // 1. Load Calculations
  // Calculate Ka considering backfill inclination (beta)
  const phi = soilProperties.internalFrictionAngle * Math.PI / 180;
  const beta = (soilProperties.backfillProfileType === 'Sloped' ? soilProperties.backfillInclination : 0) * Math.PI / 180;
  
  let Ka = Math.tan((45 - soilProperties.internalFrictionAngle / 2) * Math.PI / 180) ** 2; // Default Rankine
  if (beta > 0 && beta < phi) {
    const cosBeta = Math.cos(beta);
    const cosPhi = Math.cos(phi);
    const sqrtTerm = Math.sqrt(cosBeta * cosBeta - cosPhi * cosPhi);
    Ka = cosBeta * (cosBeta - sqrtTerm) / (cosBeta + sqrtTerm);
  }
  
  const gamma_soil = soilProperties.unitWeight;
  const Pa = 0.5 * gamma_soil * H * H * Ka;
  const Pa_y = H / 3;
  
  // Hydrostatic pressure (if active)
  const gamma_w = 1000; // kg/m3
  let P_hydro = 0;
  let P_hydro_y = 0;
  if (loads.hydrostaticActive) {
    P_hydro = 0.5 * gamma_w * H * H;
    P_hydro_y = H / 3;
  }
  
  // Surcharge (Strip Load Approx)
  let P_surcharge = 0;
  let P_surcharge_y = 0;
  if (loads.surchargeActive) {
    const q = loads.surchargeLoad;
    const X = loads.distanceFromWall;
    const W_load = loads.loadWidth;
    
    // For a strip load, active pressure can be approximated. 
    // If it's a uniform load over the whole surface (X=0, W_load is large), it's q * Ka * H.
    // If it's a strip, we simplify by assuming it adds q * Ka to the active pressure but only starts affecting the wall below a depth z = X (assuming 1:1 or 45deg distribution).
    // A simplified engineering approach: 
    if (W_load > H) {
       // Treated as infinite uniform surcharge
       P_surcharge = q * Ka * H;
       P_surcharge_y = H / 2;
    } else {
       // Strip load of width W at distance X. 
       // Approximate resultant using Boussinesq or simple Rankine slice.
       // We'll use a simple effective depth approach: affects from depth X to X + W (up to H)
       const depthStart = Math.min(X, H);
       const depthEnd = Math.min(X + W_load, H);
       const loadedHeight = depthEnd - depthStart;
       if (loadedHeight > 0) {
         P_surcharge = q * Ka * loadedHeight;
         // acts at the centroid of the loaded segment
         P_surcharge_y = H - (depthStart + depthEnd) / 2; 
       }
    }
  }
  
  const W_base = actualBaseWidth * baseThickness * CONCRETE_UNIT_WEIGHT;
  const W_stem = geometry.stemThickness * stemHeight * CONCRETE_UNIT_WEIGHT;
  const W_soil_heel = heel * stemHeight * gamma_soil;
  
  // Additional soil weight if backfill is sloped
  let W_soil_slope = 0;
  let x_soil_slope = 0;
  if (soilProperties.backfillProfileType === 'Sloped' && beta > 0) {
    const slopeHeight = heel * Math.tan(beta);
    W_soil_slope = 0.5 * heel * slopeHeight * gamma_soil;
    x_soil_slope = toe + geometry.stemThickness + (2/3) * heel;
  }
  
  const SigmaW = W_base + W_stem + W_soil_heel + W_soil_slope;
  
  // 2. Stability Checks
  // Moments about the toe (front of base)
  const x_base = actualBaseWidth / 2;
  const x_stem = toe + geometry.stemThickness / 2;
  const x_soil_heel = toe + geometry.stemThickness + heel / 2;
  
  const ResistingMoment = (W_base * x_base) + (W_stem * x_stem) + (W_soil_heel * x_soil_heel) + (W_soil_slope * x_soil_slope);
  const OverturningMoment = (Pa * Pa_y) + (P_surcharge * P_surcharge_y) + (P_hydro * P_hydro_y);
  
  const FS_overturning = OverturningMoment > 0 ? ResistingMoment / OverturningMoment : Infinity;
  const isOverturningPass = FS_overturning >= 2.0;
  
  const TotalHorizontalForce = Pa + P_surcharge + P_hydro;
  const FS_sliding = TotalHorizontalForce > 0 ? (soilProperties.frictionCoefficient * SigmaW) / TotalHorizontalForce : Infinity;
  const isSlidingPass = FS_sliding >= 1.5;
  const requiresShearKey = FS_sliding < 1.5 && state.hasShearKey === false;
  
  const x_bar = (ResistingMoment - OverturningMoment) / SigmaW;
  const eccentricity = (actualBaseWidth / 2) - x_bar;
  const e = Math.abs(eccentricity);
  const L_6 = actualBaseWidth / 6;
  const isEccentricityPass = e <= L_6;
  
  const f_max = (SigmaW / actualBaseWidth) * (1 + (6 * e) / actualBaseWidth);
  const f_min = (SigmaW / actualBaseWidth) * (1 - (6 * e) / actualBaseWidth);
  const isBearingPass = f_max <= soilProperties.allowableBearingPressure;
  
  // 3. Structural Design
  const fc = materials.concreteCompressiveStrength;
  const fy = materials.steelYieldStrength;
  const phi_v = 0.85;
  const phi_f = 0.90;
  
  // STEM
  const Pa_stem = 0.5 * gamma_soil * stemHeight * stemHeight * Ka;
  let P_sur_stem = 0;
  if (loads.surchargeActive) {
     P_sur_stem = loads.surchargeLoad * Ka * stemHeight; // simple approx for stem design
  }
  let P_hydro_stem = 0;
  if (loads.hydrostaticActive) {
     P_hydro_stem = 0.5 * gamma_w * stemHeight * stemHeight;
  }
  
  // Using 1.7 Load Factor for lateral Earth (H) and Surcharge (L)
  const V_u_stem = 1.7 * Pa_stem + 1.7 * P_sur_stem + 1.7 * P_hydro_stem;
  const M_u_stem = 1.7 * (Pa_stem * stemHeight / 3) + 1.7 * (P_sur_stem * stemHeight / 2) + 1.7 * (P_hydro_stem * stemHeight / 3);
  
  const d_stem_mm = (geometry.stemThickness * 1000) - 50; // assuming 50mm cover
  const phi_Vc_stem = phi_v * 0.29 * Math.sqrt(fc) * d_stem_mm * 10; // in kg (fc is ksc)
  const isStemShearPass = V_u_stem <= phi_Vc_stem;
  
  let As_stem = (M_u_stem * 100) / (phi_f * fy * 0.9 * (d_stem_mm / 10)); // M in kg-m -> kg-cm, fy in ksc, d in cm -> As in cm2
  const As_min_stem = 0.0018 * 100 * (geometry.stemThickness * 100);
  As_stem = Math.max(As_stem, As_min_stem);
  const rebar_stem = selectRebar(As_stem);
  
  // Stem Distribution Bars (Horizontal)
  // Approx 0.0020 of the gross cross-sectional area
  const As_dist_stem = 0.0020 * 100 * (geometry.stemThickness * 100);
  const rebar_dist_stem = selectRebar(As_dist_stem, 15, 30);
  
  // HEEL
  let V_u_heel = 0;
  let M_u_heel = 0;
  let As_heel = 0;
  let rebar_heel: RebarSelection | null = null;
  if (heel > 0) {
    const w_u_heel = 1.4 * (gamma_soil * stemHeight + CONCRETE_UNIT_WEIGHT * baseThickness) + (loads.surchargeActive ? 1.7 * loads.surchargeLoad : 0);
    V_u_heel = w_u_heel * heel;
    M_u_heel = w_u_heel * heel * heel / 2;
    const d_heel_mm = (baseThickness * 1000) - 50;
    let As_calc = (M_u_heel * 100) / (phi_f * fy * 0.9 * (d_heel_mm / 10));
    const As_min_heel = 0.0018 * 100 * (baseThickness * 100);
    As_heel = Math.max(As_calc, As_min_heel);
    rebar_heel = selectRebar(As_heel);
  }
  
  // TOE
  let V_u_toe = 0;
  let M_u_toe = 0;
  let As_toe = 0;
  let rebar_toe: RebarSelection | null = null;
  if (toe > 0) {
    // Approx factored upward pressure
    const q_u_toe = 1.4 * f_max; 
    const w_u_toe_down = 0.9 * CONCRETE_UNIT_WEIGHT * baseThickness; // min downward
    const net_q_toe = q_u_toe - w_u_toe_down;
    
    V_u_toe = net_q_toe * toe;
    M_u_toe = net_q_toe * toe * toe / 2;
    const d_toe_mm = (baseThickness * 1000) - 50;
    let As_calc = (M_u_toe * 100) / (phi_f * fy * 0.9 * (d_toe_mm / 10));
    const As_min_toe = 0.0018 * 100 * (baseThickness * 100);
    As_toe = Math.max(As_calc, As_min_toe);
    rebar_toe = selectRebar(As_toe);
  }
  
  return {
    loads: {
      Ka,
      Pa,
      P_surcharge,
      P_hydro,
      SigmaW
    },
    stability: {
      OverturningMoment,
      ResistingMoment,
      FS_overturning,
      isOverturningPass,
      TotalHorizontalForce,
      FS_sliding,
      isSlidingPass,
      requiresShearKey,
      eccentricity: e,
      isEccentricityPass,
      f_max,
      f_min,
      isBearingPass
    },
    structural: {
      stem: { M_u: M_u_stem, V_u: V_u_stem, phi_Vc: phi_Vc_stem, isShearPass: isStemShearPass, A_s: As_stem, rebar: rebar_stem, rebar_dist: rebar_dist_stem },
      heel: heel > 0 ? { M_u: M_u_heel, V_u: V_u_heel, A_s: As_heel, rebar: rebar_heel } : null,
      toe: toe > 0 ? { M_u: M_u_toe, V_u: V_u_toe, A_s: As_toe, rebar: rebar_toe } : null,
    }
  };
}
