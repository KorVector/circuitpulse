// Circuit component types
export type ComponentType = 
  | 'battery' 
  | 'resistor' 
  | 'led' 
  | 'capacitor' 
  | 'switch'
  | 'and-gate'
  | 'or-gate'
  | 'not-gate'
  | 'ground'
  | 'vcc';

// Circuit component interface
export interface CircuitComponent {
  id: string;
  type: ComponentType;
  value: string;
  label: string;
}

// Analyzed component from AI
export interface AnalyzedComponent {
  name: string;
  type: string;
  value?: string;
  quantity: number;
}

// Circuit error
export interface CircuitError {
  type: string;
  description: string;
  severity: 'warning' | 'error' | 'critical';
  location?: string;
}

// Circuit calculation
export interface Calculation {
  parameter: string;
  value: string;
  unit: string;
  formula?: string;
}

// Alternative component suggestion
export interface Alternative {
  original: string;
  alternatives: string[];
  reason: string;
  availability?: string;
}

// Causal explanation
export interface CausalExplanation {
  issue: string;
  cause: string;
  effect: string;
  solution: string;
}

// Real world factor
export interface RealWorldFactor {
  factor: string;
  impact: string;
  recommendation?: string;
}

// Danger warning
export interface DangerWarning {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  precaution: string;
}

// Optimization suggestion
export interface Optimization {
  area: string;
  suggestion: string;
  benefit: string;
}

// Reconstructed circuit node (from AI)
export interface ReconstructedNode {
  id: string;
  type: string;
  label: string;
  value: string;
  position: { x: number; y: number };
}

// Reconstructed circuit edge (from AI)
export interface ReconstructedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Reconstructed circuit from AI
export interface ReconstructedCircuit {
  description: string;
  nodes: ReconstructedNode[];
  edges: ReconstructedEdge[];
  improvements: string[];
}

// Complete circuit analysis response
export interface CircuitAnalysis {
  summary: string;
  components: AnalyzedComponent[];
  errors: CircuitError[];
  calculations: Calculation[];
  alternatives: Alternative[];
  causalExplanations: CausalExplanation[];
  realWorldFactors: RealWorldFactor[];
  dangerWarnings: DangerWarning[];
  optimizations: Optimization[];
  reconstructedCircuit?: ReconstructedCircuit;
  userAnswer?: string; // 사용자 궁금한 점에 대한 AI 답변
}

// Editor-specific types
export interface EditorNodeData {
  label: string;
  type: ComponentType;
  value?: string;
  unit?: string;
  icon?: string;
  isOn?: boolean; // For switches
}

export interface PaletteComponent {
  type: ComponentType;
  label: string;
  icon: string;
  defaultValue?: string;
  defaultUnit?: string;
}
