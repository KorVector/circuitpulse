"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { CheckCircle, ExternalLink } from "lucide-react";
import type { ReconstructedCircuit } from "@/types/circuit";
import { useRouter } from "next/navigation";
import ReconstructedBatteryNode from "./nodes/ReconstructedBatteryNode";
import ReconstructedResistorNode from "./nodes/ReconstructedResistorNode";
import ReconstructedLEDNode from "./nodes/ReconstructedLEDNode";
import ReconstructedCapacitorNode from "./nodes/ReconstructedCapacitorNode";
import ReconstructedSwitchNode from "./nodes/ReconstructedSwitchNode";
import ReconstructedGateNode from "./nodes/ReconstructedGateNode";
import ReconstructedGroundNode from "./nodes/ReconstructedGroundNode";
import ReconstructedPowerNode from "./nodes/ReconstructedPowerNode";

const nodeTypes: NodeTypes = {
  battery: ReconstructedBatteryNode,
  resistor: ReconstructedResistorNode,
  led: ReconstructedLEDNode,
  capacitor: ReconstructedCapacitorNode,
  switch: ReconstructedSwitchNode,
  and_gate: ReconstructedGateNode,
  or_gate: ReconstructedGateNode,
  not_gate: ReconstructedGateNode,
  ground: ReconstructedGroundNode,
  power: ReconstructedPowerNode,
};

interface ReconstructedCircuitViewerContentProps {
  circuit: ReconstructedCircuit;
}

function ReconstructedCircuitViewerContent({ circuit }: ReconstructedCircuitViewerContentProps) {
  const router = useRouter();

  // Convert reconstructed nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return circuit.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.label,
        value: node.value,
        type: node.type,
      },
    }));
  }, [circuit.nodes]);

  // Convert reconstructed edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return circuit.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: "#60a5fa" },
    }));
  }, [circuit.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#60a5fa" } }, eds));
    },
    [setEdges]
  );

  const handleOpenInEditor = () => {
    // Save reconstructed circuit to localStorage
    const editorData = {
      nodes: nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          icon: getIconForType(node.type || "resistor"),
          unit: "",
        },
      })),
      edges: edges,
    };
    
    localStorage.setItem("circuitpulse-reconstructed", JSON.stringify(editorData));
    router.push("/editor");
  };

  const getIconForType = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      battery: "🔋",
      resistor: "⚡",
      led: "💡",
      capacitor: "🔵",
      switch: "🔘",
      and_gate: "🔲",
      or_gate: "🔲",
      not_gate: "🔲",
      ground: "⏚",
      power: "⚡",
    };
    return iconMap[type] || "⚡";
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Description */}
      <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
        <h3 className="mb-2 font-semibold text-blue-400">재구성된 회로 설명</h3>
        <p className="text-sm text-gray-300">{circuit.description}</p>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900 overflow-hidden" style={{ minHeight: "400px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
          <Controls className="!border-gray-700 !bg-gray-800 [&_button]:!border-gray-700 [&_button]:!bg-gray-800 [&_button]:!fill-gray-300 hover:[&_button]:!bg-gray-700" />
        </ReactFlow>
      </div>

      {/* Improvements List */}
      {circuit.improvements && circuit.improvements.length > 0 && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-400">
            <CheckCircle className="h-5 w-5" />
            AI 개선사항
          </h3>
          <ul className="space-y-2">
            {circuit.improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400 mt-0.5" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Open in Editor Button */}
      <button
        onClick={handleOpenInEditor}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600"
      >
        <ExternalLink className="h-5 w-5" />
        전체 에디터에서 열기
      </button>
    </div>
  );
}

export default function ReconstructedCircuitViewer({ circuit }: { circuit: ReconstructedCircuit }) {
  return (
    <ReactFlowProvider>
      <ReconstructedCircuitViewerContent circuit={circuit} />
    </ReactFlowProvider>
  );
}
