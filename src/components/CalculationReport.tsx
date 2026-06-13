import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { WallState } from '../types';
import type { CalculationResults } from '../utils/calculationEngine';

interface CalculationReportProps {
  state: WallState;
  results: CalculationResults;
  projectName?: string;
  designedBy?: string;
  reportDate?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 36,
    paddingHorizontal: 34,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  titleBlock: {
    border: '1 solid #0f172a',
    padding: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaItem: {
    flexGrow: 1,
    borderTop: '1 solid #cbd5e1',
    paddingTop: 6,
  },
  metaLabel: {
    fontSize: 8,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginBottom: 14,
    border: '1 solid #cbd5e1',
  },
  sectionHeader: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottom: '1 solid #cbd5e1',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    padding: 10,
  },
  table: {
    display: 'flex',
    width: '100%',
    borderLeft: '1 solid #cbd5e1',
    borderTop: '1 solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    backgroundColor: '#f8fafc',
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    borderRight: '1 solid #cbd5e1',
    borderBottom: '1 solid #cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 7,
    justifyContent: 'center',
  },
  labelCell: {
    width: '38%',
  },
  valueCell: {
    width: '24%',
    textAlign: 'right',
  },
  unitCell: {
    width: '18%',
    textAlign: 'center',
  },
  statusCell: {
    width: '20%',
    textAlign: 'center',
  },
  analysisLabelCell: {
    width: '34%',
  },
  analysisValueCell: {
    width: '22%',
    textAlign: 'right',
  },
  analysisUnitCell: {
    width: '16%',
    textAlign: 'center',
  },
  analysisStatusCell: {
    width: '28%',
    textAlign: 'center',
  },
  structuralComponentCell: {
    width: '20%',
  },
  structuralValueCell: {
    width: '20%',
    textAlign: 'right',
  },
  note: {
    marginTop: 8,
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
  },
  statusPass: {
    color: '#166534',
    fontFamily: 'Helvetica-Bold',
  },
  statusFail: {
    color: '#991b1b',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1 solid #cbd5e1',
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
});

const formatNumber = (value: number, digits = 2) =>
  Number.isFinite(value)
    ? value.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '-';

const formatDate = (value?: string) =>
  value ?? new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

const getPassFail = (value: boolean) => (value ? 'PASS' : 'FAIL');

const SectionRow = ({
  label,
  value,
  unit,
  status,
  columns = 'default',
}: {
  label: string;
  value: string;
  unit: string;
  status?: string;
  columns?: 'default' | 'analysis';
}) => {
  const labelStyle = columns === 'analysis' ? styles.analysisLabelCell : styles.labelCell;
  const valueStyle = columns === 'analysis' ? styles.analysisValueCell : styles.valueCell;
  const unitStyle = columns === 'analysis' ? styles.analysisUnitCell : styles.unitCell;
  const statusStyle = columns === 'analysis' ? styles.analysisStatusCell : styles.statusCell;
  const textStyles = [
    styles.tableCell,
    statusStyle,
    ...(status === 'PASS' ? [styles.statusPass] : []),
    ...(status === 'FAIL' ? [styles.statusFail] : []),
  ];

  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, labelStyle]}>{label}</Text>
      <Text style={[styles.tableCell, valueStyle]}>{value}</Text>
      <Text style={[styles.tableCell, unitStyle]}>{unit}</Text>
      <Text style={textStyles}>
        {status ?? '-'}
      </Text>
    </View>
  );
};

export const CalculationReport = ({
  state,
  results,
  projectName = 'Retaining Wall Design Check',
  designedBy = 'RetainCalc Pro User',
  reportDate,
}: CalculationReportProps) => {
  const { geometry, soilProperties, loads, materials, wallType, lShapeOrientation, hasShearKey } = state;
  const { stability, structural } = results;

  const wallTypeLabel =
    wallType === 'L-Shape' && lShapeOrientation
      ? `${wallType} (${lShapeOrientation})`
      : wallType;

  return (
    <Document title="Retaining Wall Calculation Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>RETAINING WALL CALCULATION SHEET</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Project Name</Text>
              <Text style={styles.metaValue}>{projectName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{formatDate(reportDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Designed By</Text>
              <Text style={styles.metaValue}>{designedBy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Section 1: Input Parameters</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.labelCell, styles.tableHeaderCell]}>Parameter</Text>
                <Text style={[styles.tableCell, styles.valueCell, styles.tableHeaderCell]}>Value</Text>
                <Text style={[styles.tableCell, styles.unitCell, styles.tableHeaderCell]}>Unit</Text>
                <Text style={[styles.tableCell, styles.statusCell, styles.tableHeaderCell]}>Notes</Text>
              </View>
              <SectionRow label="Wall Type" value={wallTypeLabel} unit="-" status="-" />
              <SectionRow label="Total Height, H" value={formatNumber(geometry.totalHeight, 2)} unit="m" status="-" />
              <SectionRow label="Base Width, B" value={formatNumber(geometry.baseWidth, 2)} unit="m" status="-" />
              <SectionRow label="Base Thickness" value={formatNumber(geometry.baseThickness, 2)} unit="m" status="-" />
              <SectionRow label="Stem Thickness" value={formatNumber(geometry.stemThickness, 2)} unit="m" status="-" />
              <SectionRow label="Toe Width" value={formatNumber(geometry.toeWidth, 2)} unit="m" status="-" />
              <SectionRow label="Heel Width" value={formatNumber(geometry.heelWidth, 2)} unit="m" status="-" />
              <SectionRow label="Allowable Bearing Pressure" value={formatNumber(soilProperties.allowableBearingPressure, 0)} unit="kg/m2" status="-" />
              <SectionRow label="Base Friction Coefficient" value={formatNumber(soilProperties.frictionCoefficient, 2)} unit="-" status="-" />
              <SectionRow label="Backfill Inclination" value={formatNumber(soilProperties.backfillInclination, 1)} unit="deg" status="-" />
              <SectionRow label="Surcharge Load" value={formatNumber(loads.surchargeLoad, 0)} unit="kg/m2" status={loads.surchargeActive ? 'ON' : 'OFF'} />
              <SectionRow label="Hydrostatic Pressure" value={loads.hydrostaticActive ? 'Active' : 'Inactive'} unit="-" status={loads.hydrostaticActive ? 'ON' : 'OFF'} />
              <SectionRow label="Concrete Strength, fc'" value={formatNumber(materials.concreteCompressiveStrength, 0)} unit="MPa" status="-" />
              <SectionRow label="Steel Yield Strength, fy" value={formatNumber(materials.steelYieldStrength, 0)} unit="MPa" status="-" />
              <SectionRow label="Shear Key" value={hasShearKey ? 'Provided' : 'Not Provided'} unit="-" status="-" />
            </View>
            <Text style={styles.note}>
              Soil profile: {soilProperties.layers.map((layer) => `${layer.name} (${layer.soilType})`).join('; ')}.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Section 2: Stability Analysis</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.analysisLabelCell, styles.tableHeaderCell]}>Check / Quantity</Text>
                <Text style={[styles.tableCell, styles.analysisValueCell, styles.tableHeaderCell]}>Value</Text>
                <Text style={[styles.tableCell, styles.analysisUnitCell, styles.tableHeaderCell]}>Unit</Text>
                <Text style={[styles.tableCell, styles.analysisStatusCell, styles.tableHeaderCell]}>Result</Text>
              </View>
              <SectionRow label="Pa (Active Earth Pressure)" value={formatNumber(results.loads.Pa, 2)} unit="kg/m" columns="analysis" />
              <SectionRow label="Sigma W (Total Vertical Load)" value={formatNumber(results.loads.SigmaW, 2)} unit="kg/m" columns="analysis" />
              <SectionRow label="Total Horizontal Force" value={formatNumber(stability.TotalHorizontalForce, 2)} unit="kg/m" columns="analysis" />
              <SectionRow label="Resisting Moment" value={formatNumber(stability.ResistingMoment, 2)} unit="kg-m/m" columns="analysis" />
              <SectionRow label="Overturning Moment" value={formatNumber(stability.OverturningMoment, 2)} unit="kg-m/m" columns="analysis" />
              <SectionRow label="FS against Overturning" value={formatNumber(stability.FS_overturning, 2)} unit="-" status={getPassFail(stability.isOverturningPass)} columns="analysis" />
              <SectionRow label="FS against Sliding" value={formatNumber(stability.FS_sliding, 2)} unit="-" status={getPassFail(stability.isSlidingPass)} columns="analysis" />
              <SectionRow label="Eccentricity, e" value={formatNumber(stability.eccentricity, 3)} unit="m" status={getPassFail(stability.isEccentricityPass)} columns="analysis" />
              <SectionRow label="Maximum Bearing Pressure" value={formatNumber(stability.f_max, 2)} unit="kg/m2" status={getPassFail(stability.isBearingPass)} columns="analysis" />
              <SectionRow label="Minimum Bearing Pressure" value={formatNumber(stability.f_min, 2)} unit="kg/m2" columns="analysis" />
            </View>
            <Text style={styles.note}>
              Acceptance criteria: overturning F.S. {'>='} 2.0, sliding F.S. {'>='} 1.5, and bearing pressure within allowable limit.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Section 3: Structural Design</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.structuralComponentCell, styles.tableHeaderCell]}>Component</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell, styles.tableHeaderCell]}>Mu (kg-m)</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell, styles.tableHeaderCell]}>Vu (kg)</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell, styles.tableHeaderCell]}>phi Vc (kg)</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell, styles.tableHeaderCell]}>Req. As (cm2/m)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.structuralComponentCell]}>Stem</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.stem?.M_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.stem?.V_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.stem?.phi_Vc ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.stem?.A_s ?? 0, 2)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.structuralComponentCell]}>Toe</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.toe?.M_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.toe?.V_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>-</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.toe?.A_s ?? 0, 2)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.structuralComponentCell]}>Heel</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.heel?.M_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.heel?.V_u ?? 0, 2)}</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>-</Text>
                <Text style={[styles.tableCell, styles.structuralValueCell]}>{formatNumber(structural.heel?.A_s ?? 0, 2)}</Text>
              </View>
            </View>
            <Text style={styles.note}>
              Reinforcement demand is reported per meter width of wall. Stem shear check compares Vu with phi Vc; slab reinforcement values reflect required tensile steel.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated from RetainCalc Pro. Values are based on the currently displayed calculation inputs and assumptions.
        </Text>
      </Page>
    </Document>
  );
};
