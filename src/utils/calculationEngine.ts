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
  
  let toe = geometry.toeWidth;
  let heel = geometry.heelWidth;
  
  if (wallType === 'L-Shape') {
    if (lShapeOrientation === 'Heel-only') toe = 0;
    else if (lShapeOrientation === 'Toe-only') heel = 0;
  }
  
  const actualBaseWidth = toe + geometry.stemThickness + heel;
  
  // 1. Multi-Layer Earth Pressure Analysis
  let Pa = 0;
  let overturningMomentFromEarth = 0;
  let W_soil_heel = 0;
  
  const beta = (soilProperties.backfillProfileType === 'Sloped' ? soilProperties.backfillInclination : 0) * Math.PI / 180;
  const cosBeta = Math.cos(beta);
  
  let currentDepth = 0;
  let currentSigmaV = loads.surchargeActive && loads.loadWidth > H ? loads.surchargeLoad : 0; // simplify: treat wide surcharge as infinite uniform for sigmaV
  
  // For average Ka calculation to display in UI
  let sumKa = 0;
  let numLayers = 0;

  for (const layer of soilProperties.layers) {
    if (currentDepth >= H) break; // Reached bottom of wall
    
    // Determine layer start and end depth relative to wall height
    const z_top = currentDepth;
    const layerThickness = layer.thickness;
    const z_bot_unclipped = z_top + layerThickness;
    
    // Clipping logic
    const isClip = soilProperties.layerClipping === 'clip_to_wall';
    const z_bot = isClip ? Math.min(z_bot_unclipped, H) : z_bot_unclipped;
    const h_i = z_bot - z_top;
    
    if (h_i <= 0) break;

    // Calculate Ka for this layer
    const phi = layer.frictionAngle * Math.PI / 180;
    let Ka = Math.tan((45 - layer.frictionAngle / 2) * Math.PI / 180) ** 2;
    if (beta > 0 && beta < phi) {
      const cosPhi = Math.cos(phi);
      const sqrtTerm = Math.sqrt(cosBeta * cosBeta - cosPhi * cosPhi);
      Ka = cosBeta * (cosBeta - sqrtTerm) / (cosBeta + sqrtTerm);
    }
    
    sumKa += Ka;
    numLayers++;

    // Vertical stress at top and bottom of layer
    const sigma_v_top = currentSigmaV;
    const sigma_v_bot = currentSigmaV + (layer.unitWeight * h_i);
    
    // Active pressure at top and bottom (Rankine with cohesion)
    let pa_top = sigma_v_top * Ka - 2 * layer.cohesion * Math.sqrt(Ka);
    let pa_bot = sigma_v_bot * Ka - 2 * layer.cohesion * Math.sqrt(Ka);
    
    // Tension Crack check
    let P_layer = 0;
    let y_centroid_from_bottom = 0;

    if (soilProperties.tensionCrackAssumption === 'ignore_negative') {
      if (pa_top < 0 && pa_bot <= 0) {
        // Entire layer is in tension, ignore
        P_layer = 0;
      } else if (pa_top < 0 && pa_bot > 0) {
        // Tension crack within this layer
        // Find depth where pa = 0: z_c = (2c*sqrt(Ka) - sigma_v_top*Ka) / (gamma*Ka)
        const z_c_local = (2 * layer.cohesion * Math.sqrt(Ka) - sigma_v_top * Ka) / (layer.unitWeight * Ka);
        const h_active = h_i - z_c_local;
        P_layer = 0.5 * pa_bot * h_active;
        // centroid is h_active/3 from bottom of layer
        const y_centroid_from_layer_bot = h_active / 3;
        y_centroid_from_bottom = (H - z_bot) + y_centroid_from_layer_bot;
      } else {
        // Entire layer has positive pressure (Trapezoid)
        P_layer = 0.5 * (pa_top + pa_bot) * h_i;
        const y_centroid_from_layer_bot = (h_i / 3) * ((2 * pa_top + pa_bot) / (pa_top + pa_bot));
        y_centroid_from_bottom = (H - z_bot) + y_centroid_from_layer_bot;
      }
    } else {
      // Include negative pressure (Theoretical trapezoid integral)
      P_layer = 0.5 * (pa_top + pa_bot) * h_i;
      if (P_layer !== 0) {
        const y_centroid_from_layer_bot = (h_i / 3) * ((2 * pa_top + pa_bot) / (pa_top + pa_bot));
        y_centroid_from_bottom = (H - z_bot) + y_centroid_from_layer_bot;
      }
    }

    Pa += P_layer;
    if (P_layer !== 0 && !isNaN(y_centroid_from_bottom)) {
      overturningMomentFromEarth += P_layer * y_centroid_from_bottom;
    }

    // Weight of soil on heel for this layer
    // Stem height is up to (H - baseThickness)
    if (z_top < stemHeight) {
      const h_heel_layer = Math.min(stemHeight, z_bot) - z_top;
      if (h_heel_layer > 0) {
        W_soil_heel += heel * h_heel_layer * layer.unitWeight;
      }
    }

    currentSigmaV = sigma_v_bot;
    currentDepth = z_bot;
  }
  
  const avgKa = numLayers > 0 ? sumKa / numLayers : 0.33;
  
  // Hydrostatic pressure
  const gamma_w = 1000;
  let P_hydro = 0;
  let P_hydro_y = 0;
  if (loads.hydrostaticActive) {
    P_hydro = 0.5 * gamma_w * H * H;
    P_hydro_y = H / 3;
  }
  
  // Surcharge (Strip Load)
  let P_surcharge = 0;
  let P_surcharge_y = 0;
  if (loads.surchargeActive && loads.loadWidth <= H) {
    // If it was > H, it was included in sigmaV for earth pressure calculation
    const q = loads.surchargeLoad;
    const X = loads.distanceFromWall;
    const W_load = loads.loadWidth;
    const depthStart = Math.min(X, H);
    const depthEnd = Math.min(X + W_load, H);
    const loadedHeight = depthEnd - depthStart;
    if (loadedHeight > 0) {
      P_surcharge = q * avgKa * loadedHeight;
      P_surcharge_y = H - (depthStart + depthEnd) / 2; 
    }
  }

  const W_base = actualBaseWidth * baseThickness * CONCRETE_UNIT_WEIGHT;
  const W_stem = geometry.stemThickness * stemHeight * CONCRETE_UNIT_WEIGHT;
  
  let W_soil_slope = 0;
  let x_soil_slope = 0;
  if (soilProperties.backfillProfileType === 'Sloped' && beta > 0) {
    const slopeHeight = heel * Math.tan(beta);
    // Use top layer unit weight for the slope
    const topGamma = soilProperties.layers[0]?.unitWeight || 1800;
    W_soil_slope = 0.5 * heel * slopeHeight * topGamma;
    x_soil_slope = toe + geometry.stemThickness + (2/3) * heel;
  }
  
  const SigmaW = W_base + W_stem + W_soil_heel + W_soil_slope;
  
  // 2. Stability Checks
  const x_base = actualBaseWidth / 2;
  const x_stem = toe + geometry.stemThickness / 2;
  const x_soil_heel = toe + geometry.stemThickness + heel / 2;
  
  const ResistingMoment = (W_base * x_base) + (W_stem * x_stem) + (W_soil_heel * x_soil_heel) + (W_soil_slope * x_soil_slope);
  const OverturningMoment = overturningMomentFromEarth + (P_surcharge * P_surcharge_y) + (P_hydro * P_hydro_y);
  
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
  // For structural design, we approximate stem pressure using avgKa and a single equivalent density for simplicity
  // or use the precise Pa_stem. Here we approximate:
  let gamma_avg = soilProperties.layers.length > 0 
    ? soilProperties.layers.reduce((sum, l) => sum + l.unitWeight*l.thickness, 0) / soilProperties.layers.reduce((sum, l) => sum + l.thickness, 0)
    : 1800;
    
  const Pa_stem = 0.5 * gamma_avg * stemHeight * stemHeight * avgKa;
  let P_sur_stem = loads.surchargeActive ? loads.surchargeLoad * avgKa * stemHeight : 0;
  let P_hydro_stem = loads.hydrostaticActive ? 0.5 * gamma_w * stemHeight * stemHeight : 0;
  
  const V_u_stem = 1.7 * Pa_stem + 1.7 * P_sur_stem + 1.7 * P_hydro_stem;
  const M_u_stem = 1.7 * (Pa_stem * stemHeight / 3) + 1.7 * (P_sur_stem * stemHeight / 2) + 1.7 * (P_hydro_stem * stemHeight / 3);
  
  const d_stem_mm = (geometry.stemThickness * 1000) - 50; 
  const phi_Vc_stem = phi_v * 0.29 * Math.sqrt(fc) * d_stem_mm * 10; 
  const isStemShearPass = V_u_stem <= phi_Vc_stem;
  
  let As_stem = (M_u_stem * 100) / (phi_f * fy * 0.9 * (d_stem_mm / 10)); 
  const As_min_stem = 0.0018 * 100 * (geometry.stemThickness * 100);
  As_stem = Math.max(As_stem, As_min_stem);
  const rebar_stem = selectRebar(As_stem);
  
  const As_dist_stem = 0.0020 * 100 * (geometry.stemThickness * 100);
  const rebar_dist_stem = selectRebar(As_dist_stem, 15, 30);
  
  // HEEL
  let V_u_heel = 0;
  let M_u_heel = 0;
  let As_heel = 0;
  let rebar_heel: RebarSelection | null = null;
  if (heel > 0) {
    const w_u_heel = 1.4 * (gamma_avg * stemHeight + CONCRETE_UNIT_WEIGHT * baseThickness) + (loads.surchargeActive ? 1.7 * loads.surchargeLoad : 0);
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
    const q_u_toe = 1.4 * f_max; 
    const w_u_toe_down = 0.9 * CONCRETE_UNIT_WEIGHT * baseThickness; 
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
      Ka: avgKa,
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
