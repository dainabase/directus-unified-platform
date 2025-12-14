// Recharts - Import direct depuis npm
// Ne PAS utiliser window.Recharts !

export {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBar,
  RadialBarChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
  Funnel,
  FunnelChart,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ErrorBar,
  LabelList
} from 'recharts'

// Helper pour vérifier si Recharts est disponible
export const isRechartsLoaded = () => true

// Export par défaut pour compatibilité
import * as RechartsAll from 'recharts'
export default RechartsAll
