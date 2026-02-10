"use client";

import { useCallback, useState, useRef, DragEvent, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import ComponentPalette from "./ComponentPalette";
import PropertiesPanel from "./PropertiesPanel";
import EditorToolbar from "./EditorToolbar";
import BatteryNode from "./nodes/BatteryNode";
import ResistorNode from "./nodes/ResistorNode";
import LEDNode from "./nodes/LEDNode";
import CapacitorNode from "./nodes/CapacitorNode";
import SwitchNode from "./nodes/SwitchNode";
import GateNode from "./nodes/GateNode";
import GroundNode from "./nodes/GroundNode";
import PowerNode from "./nodes/PowerNode";

import type { EditorNodeData, PaletteComponent } from "@/types/circuit";
import type { CircuitAnalysis } from "@/types/circuit";
import { Loader2, X } from "lucide-react";

const nodeTypes: NodeTypes = {
  battery: BatteryNode,
  resistor: ResistorNode,
  led: LEDNode,
  capacitor: CapacitorNode,
  switch: SwitchNode,
  "and-gate": GateNode,
  "or-gate": GateNode,
  "not-gate": GateNode,
  ground: GroundNode,
  vcc: PowerNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

function CircuitEditorContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<EditorNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<EditorNodeData> | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const [history, setHistory] = useState<{ nodes: Node<EditorNodeData>[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CircuitAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // First check if there's analysis data from the analyze page
    const analysisData = localStorage.getItem("editorAnalysisData");
    if (analysisData) {
      try {
        const analysis = JSON.parse(analysisData);
        
        // Icon mapping helper
        const getIconForType = (type: string): string => {
          const iconMap: { [key: string]: string } = {
            battery: "🔋",
            resistor: "⚡",
            led: "💡",
            capacitor: "🔌",
            switch: "🔛",
          };
          return iconMap[type] || "⚡";
        };
        
        // Convert analysis components to nodes
        const analysisNodes: Node<EditorNodeData>[] = analysis.components.map((comp: any, idx: number) => {
          const typeMap: { [key: string]: string } = {
            "전지": "battery",
            "battery": "battery",
            "저항": "resistor",
            "resistor": "resistor",
            "LED": "led",
            "led": "led",
            "커패시터": "capacitor",
            "capacitor": "capacitor",
            "스위치": "switch",
            "switch": "switch",
          };
          
          const nodeType = typeMap[comp.type] || "resistor";
          
          return {
            id: getNodeId(),
            type: nodeType,
            position: { x: 100 + (idx % 3) * 200, y: 100 + Math.floor(idx / 3) * 150 },
            data: {
              label: comp.name,
              type: nodeType as any,
              value: comp.value || "",
              unit: "",
              icon: getIconForType(nodeType),
            },
          };
        });
        
        setNodes(analysisNodes);
        setEdges([]);
        localStorage.removeItem("editorAnalysisData");
        return;
      } catch (e) {
        console.error("Failed to load analysis data:", e);
      }
    }
    
    // Otherwise load saved circuit data
    const savedData = localStorage.getItem("editorCircuitData");
    if (savedData) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
        setNodes(savedNodes);
        setEdges(savedEdges);
      } catch (e) {
        console.error("Failed to load saved circuit:", e);
      }
    }
  }, [setNodes, setEdges]);

  // Save history
  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#60a5fa" } }, eds));
      saveHistory();
    },
    [setEdges, saveHistory]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const componentData = event.dataTransfer.getData("application/reactflow");

      if (!componentData) return;

      const component: PaletteComponent = JSON.parse(componentData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<EditorNodeData> = {
        id: getNodeId(),
        type: component.type,
        position,
        data: {
          label: component.label,
          type: component.type,
          value: component.defaultValue,
          unit: component.defaultUnit,
          icon: component.icon,
          isOn: component.type === "switch" ? false : undefined,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      saveHistory();
    },
    [reactFlowInstance, setNodes, saveHistory]
  );

  const onDragStart = (event: DragEvent, component: PaletteComponent) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(component));
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeClick = useCallback((_: any, node: Node<EditorNodeData>) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<EditorNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...prev.data, ...updates } } : null
        );
      }
      saveHistory();
    },
    [setNodes, selectedNode, saveHistory]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
      saveHistory();
    },
    [setNodes, setEdges, saveHistory]
  );

  const onToggleSwitch = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, isOn: !node.data.isOn } }
            : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...prev.data, isOn: !prev.data.isOn } } : null
        );
      }
    },
    [setNodes, selectedNode]
  );

  const onNew = useCallback(() => {
    if (confirm("새로운 회로를 만들시겠습니까? 현재 작업이 삭제됩니다.")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setHistory([]);
      setHistoryIndex(-1);
      localStorage.removeItem("editorCircuitData");
    }
  }, [setNodes, setEdges]);

  const onClear = useCallback(() => {
    if (confirm("모든 부품을 삭제하시겠습니까?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      saveHistory();
    }
  }, [setNodes, setEdges, saveHistory]);

  const onUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const onRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const onAnalyze = useCallback(async () => {
    if (nodes.length === 0) {
      alert("분석할 회로가 없습니다. 부품을 추가해주세요.");
      return;
    }

    setAnalysisLoading(true);
    setShowAnalysisModal(true);

    try {
      const circuitData = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.type,
          label: n.data.label,
          value: n.data.value,
          unit: n.data.unit,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
      };

      const response = await fetch("/api/analyze-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circuit: circuitData }),
      });

      if (!response.ok) {
        throw new Error("분석 중 오류가 발생했습니다");
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("회로 분석 중 오류가 발생했습니다.");
    } finally {
      setAnalysisLoading(false);
    }
  }, [nodes, edges]);

  const onSimulate = useCallback(() => {
    alert("시뮬레이션 기능은 곧 추가될 예정입니다!");
  }, []);

  // Save to localStorage when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      localStorage.setItem("editorCircuitData", JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges]);

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <EditorToolbar
        onNew={onNew}
        onAnalyze={onAnalyze}
        onSimulate={onSimulate}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onClear={onClear}
      />

      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette onDragStart={onDragStart} />

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
            <Controls className="!border-gray-700 !bg-gray-800 [&_button]:!border-gray-700 [&_button]:!bg-gray-800 [&_button]:!fill-gray-300 hover:[&_button]:!bg-gray-700" />
            <MiniMap
              className="!border-gray-700 !bg-gray-800"
              nodeColor={(node) => {
                switch (node.type) {
                  case "battery":
                    return "#60a5fa";
                  case "resistor":
                    return "#fbbf24";
                  case "led":
                    return "#f87171";
                  default:
                    return "#9ca3af";
                }
              }}
            />
          </ReactFlow>
        </div>

        <PropertiesPanel
          selectedNode={selectedNode}
          nodes={nodes}
          edges={edges}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onToggleSwitch={onToggleSwitch}
        />
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 p-4">
              <h2 className="text-xl font-semibold text-white">AI 분석 결과</h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(80vh - 80px)" }}>
              {analysisLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
                    <p className="text-gray-400">AI가 회로를 분석하고 있습니다...</p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-2 font-semibold text-blue-400">종합 분석</h3>
                    <p className="text-sm text-gray-300">{analysisResult.summary}</p>
                  </div>

                  {/* Components */}
                  {analysisResult.components && analysisResult.components.length > 0 && (
                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <h3 className="mb-3 font-semibold text-blue-400">인식된 부품</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {analysisResult.components.map((comp, idx) => (
                          <div key={idx} className="rounded border border-gray-700 bg-gray-900/50 p-2 text-sm">
                            <p className="font-medium text-gray-200">{comp.name}</p>
                            <p className="text-xs text-gray-400">
                              {comp.type} {comp.value && `• ${comp.value}`} • 수량: {comp.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {analysisResult.errors && analysisResult.errors.length > 0 && (
                    <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-4">
                      <h3 className="mb-3 font-semibold text-orange-400">오류 진단</h3>
                      <div className="space-y-2">
                        {analysisResult.errors.map((error, idx) => (
                          <div key={idx} className="rounded border border-orange-500/30 p-3">
                            <p className="mb-1 text-sm font-medium text-orange-300">{error.type}</p>
                            <p className="text-xs text-gray-300">{error.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculations */}
                  {analysisResult.calculations && analysisResult.calculations.length > 0 && (
                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <h3 className="mb-3 font-semibold text-green-400">회로 계산</h3>
                      <div className="space-y-2">
                        {analysisResult.calculations.map((calc, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded border border-gray-700 bg-gray-900/50 p-2 text-sm">
                            <span className="text-gray-300">{calc.parameter}</span>
                            <span className="font-medium text-green-400">
                              {calc.value} {calc.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CircuitEditor() {
  return (
    <ReactFlowProvider>
      <CircuitEditorContent />
    </ReactFlowProvider>
  );
}
