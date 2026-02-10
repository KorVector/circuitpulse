import { Node, Edge } from "reactflow";
import type { EditorNodeData } from "@/types/circuit";

export interface SimulationResult {
  totalVoltage: number;
  totalResistance: number;
  totalCurrent: number;
  componentResults: ComponentResult[];
  warnings: SimulationWarning[];
  pathStates: PathState[];
}

export interface ComponentResult {
  nodeId: string;
  type: string;
  label: string;
  voltage: number;
  current: number;
  status: 'normal' | 'on' | 'warning' | 'danger' | 'off';
}

export interface SimulationWarning {
  type: 'no-resistor' | 'short-circuit' | 'overcurrent' | 'open-circuit';
  severity: 'warning' | 'danger';
  message: string;
  affectedNodeIds: string[];
}

export interface PathState {
  edgeId: string;
  active: boolean;
  current: number;
}

// Helper to parse numeric values from strings (e.g., "9V" -> 9, "220Ω" -> 220)
function parseValue(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : defaultValue;
}

// Build adjacency list from edges
function buildGraph(nodes: Node<EditorNodeData>[], edges: Edge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  
  // Initialize all nodes
  nodes.forEach(node => {
    graph.set(node.id, []);
  });
  
  // Add edges (both directions for undirected graph)
  edges.forEach(edge => {
    const sourceNeighbors = graph.get(edge.source) || [];
    const targetNeighbors = graph.get(edge.target) || [];
    
    if (!sourceNeighbors.includes(edge.target)) {
      sourceNeighbors.push(edge.target);
    }
    if (!targetNeighbors.includes(edge.source)) {
      targetNeighbors.push(edge.source);
    }
    
    graph.set(edge.source, sourceNeighbors);
    graph.set(edge.target, targetNeighbors);
  });
  
  return graph;
}

// Find all paths from battery using DFS
function findCircuitPaths(
  graph: Map<string, string[]>,
  nodes: Node<EditorNodeData>[],
  batteryNode: Node<EditorNodeData>
): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();
  
  function dfs(currentId: string, path: string[], depth: number) {
    // Prevent infinite loops
    if (depth > 20) return;
    
    // If we found a path back to battery (and it's not just the start)
    if (currentId === batteryNode.id && path.length > 1) {
      paths.push([...path]);
      return;
    }
    
    // Avoid revisiting in same path
    if (path.includes(currentId)) return;
    
    path.push(currentId);
    const neighbors = graph.get(currentId) || [];
    
    for (const neighbor of neighbors) {
      dfs(neighbor, path, depth + 1);
    }
    
    path.pop();
  }
  
  dfs(batteryNode.id, [], 0);
  return paths;
}

// Check if a path is active (all switches are ON)
function isPathActive(path: string[], nodes: Node<EditorNodeData>[]): boolean {
  for (const nodeId of path) {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.data.type === 'switch' && !node.data.isOn) {
      return false;
    }
  }
  return true;
}

// Calculate resistance for a path
function calculatePathResistance(path: string[], nodes: Node<EditorNodeData>[]): number {
  let totalResistance = 0;
  
  for (const nodeId of path) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    
    if (node.data.type === 'resistor') {
      totalResistance += parseValue(node.data.value, 220); // Default 220Ω
    } else if (node.data.type === 'led') {
      // LEDs have small internal resistance, typically 10-20Ω depending on type
      // Using 10Ω as a conservative estimate for standard 5mm LEDs
      totalResistance += 10;
    }
  }
  
  return totalResistance;
}

// Detect if LED is directly connected to battery without resistor
function hasNoResistor(path: string[], nodes: Node<EditorNodeData>[]): boolean {
  let hasLED = false;
  let hasResistor = false;
  
  for (const nodeId of path) {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.data.type === 'led') hasLED = true;
    if (node?.data.type === 'resistor') hasResistor = true;
  }
  
  return hasLED && !hasResistor;
}

export function simulateCircuit(
  nodes: Node<EditorNodeData>[],
  edges: Edge[]
): SimulationResult {
  const warnings: SimulationWarning[] = [];
  const componentResults: ComponentResult[] = [];
  const pathStates: PathState[] = [];
  
  // Find battery nodes
  const batteries = nodes.filter(n => n.data.type === 'battery');
  
  if (batteries.length === 0) {
    // No battery - return empty result
    return {
      totalVoltage: 0,
      totalResistance: 0,
      totalCurrent: 0,
      componentResults: [],
      warnings: [{
        type: 'open-circuit',
        severity: 'warning',
        message: '배터리가 없습니다. 회로에 전원을 추가하세요.',
        affectedNodeIds: []
      }],
      pathStates: []
    };
  }
  
  const battery = batteries[0]; // Use first battery
  const voltage = parseValue(battery.data.value, 9); // Default 9V
  
  // Build circuit graph
  const graph = buildGraph(nodes, edges);
  
  // Find all paths from battery
  const paths = findCircuitPaths(graph, nodes, battery);
  
  if (paths.length === 0) {
    // Open circuit
    warnings.push({
      type: 'open-circuit',
      severity: 'warning',
      message: '개방 회로: 배터리가 다른 부품에 연결되지 않았습니다.',
      affectedNodeIds: [battery.id]
    });
    
    return {
      totalVoltage: voltage,
      totalResistance: 0,
      totalCurrent: 0,
      componentResults: [],
      warnings,
      pathStates: []
    };
  }
  
  // Find active paths (switches are ON)
  const activePaths = paths.filter(path => isPathActive(path, nodes));
  
  if (activePaths.length === 0) {
    // All switches are off
    edges.forEach(edge => {
      pathStates.push({
        edgeId: edge.id,
        active: false,
        current: 0
      });
    });
    
    return {
      totalVoltage: voltage,
      totalResistance: 0,
      totalCurrent: 0,
      componentResults: nodes.map(n => ({
        nodeId: n.id,
        type: n.data.type,
        label: n.data.label,
        voltage: 0,
        current: 0,
        status: 'off'
      })),
      warnings: [],
      pathStates
    };
  }
  
  // Calculate resistance and current for first active path (simplified)
  const activePath = activePaths[0];
  const resistance = calculatePathResistance(activePath, nodes);
  
  // Check for short circuit (no resistance)
  if (resistance < 1) {
    warnings.push({
      type: 'short-circuit',
      severity: 'danger',
      message: '⚠️ 단락 회로 감지! 저항이 거의 없어 매우 위험합니다.',
      affectedNodeIds: activePath
    });
  }
  
  // Check for LED without resistor
  if (hasNoResistor(activePath, nodes)) {
    const ledNodes = activePath
      .map(id => nodes.find(n => n.id === id))
      .filter(n => n?.data.type === 'led')
      .map(n => n!.id);
    
    warnings.push({
      type: 'no-resistor',
      severity: 'danger',
      message: '⚠️ LED 소손 위험! 전류 제한 저항을 추가하세요.',
      affectedNodeIds: ledNodes
    });
  }
  
  // Calculate current using Ohm's Law: I = V / R
  const current = resistance > 0 ? (voltage / resistance) * 1000 : 0; // Convert to mA
  
  // Check for overcurrent in LEDs
  const ledsInPath = activePath
    .map(id => nodes.find(n => n.id === id))
    .filter(n => n?.data.type === 'led');
  
  if (ledsInPath.length > 0 && current > 20) {
    warnings.push({
      type: 'overcurrent',
      severity: 'warning',
      message: `⚠️ LED 정격 전류 초과 (${current.toFixed(1)}mA > 20mA)`,
      affectedNodeIds: ledsInPath.map(n => n!.id)
    });
  }
  
  // Mark edges as active/inactive
  edges.forEach(edge => {
    // Check if this edge is in an active path
    let isActive = false;
    for (const path of activePaths) {
      for (let i = 0; i < path.length - 1; i++) {
        if (
          (path[i] === edge.source && path[i + 1] === edge.target) ||
          (path[i] === edge.target && path[i + 1] === edge.source)
        ) {
          isActive = true;
          break;
        }
      }
      if (isActive) break;
    }
    
    pathStates.push({
      edgeId: edge.id,
      active: isActive,
      current: isActive ? current : 0
    });
  });
  
  // Generate component results
  nodes.forEach(node => {
    const isInActivePath = activePath.includes(node.id);
    const hasWarning = warnings.some(w => w.affectedNodeIds.includes(node.id));
    
    let status: ComponentResult['status'] = 'normal';
    let componentCurrent = 0;
    let componentVoltage = 0;
    
    if (!isInActivePath) {
      status = 'off';
    } else {
      componentCurrent = current;
      
      if (node.data.type === 'resistor') {
        const r = parseValue(node.data.value, 220);
        componentVoltage = (componentCurrent / 1000) * r; // V = IR
      } else if (node.data.type === 'led') {
        // LED forward voltage: typically 1.8-2.2V for red, 3.0-3.5V for blue/white
        // Using 2V as a typical value for standard red LEDs
        componentVoltage = 2;
        if (hasWarning) {
          status = 'warning';
        } else {
          status = 'on';
        }
      } else if (node.data.type === 'battery') {
        componentVoltage = voltage;
      }
      
      if (hasWarning && status !== 'on') {
        status = 'warning';
      }
    }
    
    componentResults.push({
      nodeId: node.id,
      type: node.data.type,
      label: node.data.label,
      voltage: componentVoltage,
      current: componentCurrent,
      status
    });
  });
  
  return {
    totalVoltage: voltage,
    totalResistance: resistance,
    totalCurrent: current,
    componentResults,
    warnings,
    pathStates
  };
}
