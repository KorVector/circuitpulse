"use client";

import { Trash2 } from "lucide-react";
import type { Node } from "reactflow";
import type { EditorNodeData } from "@/types/circuit";

interface PropertiesPanelProps {
  selectedNode: Node<EditorNodeData> | null;
  nodes: Node<EditorNodeData>[];
  edges: any[];
  onUpdateNode: (nodeId: string, updates: Partial<EditorNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onToggleSwitch: (nodeId: string) => void;
}

export default function PropertiesPanel({
  selectedNode,
  nodes,
  edges,
  onUpdateNode,
  onDeleteNode,
  onToggleSwitch,
}: PropertiesPanelProps) {
  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">속성 패널</h2>
      
      {selectedNode ? (
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-400">선택한 부품</h3>
            
            <div className="mb-3 flex items-center gap-2">
              <div className="text-2xl">{selectedNode.data.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">
                  {selectedNode.data.label}
                </div>
                <div className="text-xs text-gray-500">{selectedNode.data.type}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  라벨
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, { label: e.target.value })
                  }
                  className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              {selectedNode.data.type !== "ground" && 
               selectedNode.data.type !== "and-gate" &&
               selectedNode.data.type !== "or-gate" &&
               selectedNode.data.type !== "not-gate" &&
               selectedNode.data.type !== "switch" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      값
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.value || ""}
                      onChange={(e) =>
                        onUpdateNode(selectedNode.id, { value: e.target.value })
                      }
                      className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">
                      단위
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.unit || ""}
                      onChange={(e) =>
                        onUpdateNode(selectedNode.id, { unit: e.target.value })
                      }
                      className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
              
              {selectedNode.data.type === "switch" && (
                <button
                  onClick={() => onToggleSwitch(selectedNode.id)}
                  className={`w-full rounded px-3 py-2 text-sm font-medium transition-colors ${
                    selectedNode.data.isOn
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {selectedNode.data.isOn ? "ON 상태" : "OFF 상태"}
                </button>
              )}
            </div>
            
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              부품 삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm">부품을 선택하세요</p>
          </div>
        </div>
      )}
      
      <div className="mt-4 space-y-3 rounded-lg border border-gray-800 bg-gray-800/50 p-4">
        <h3 className="text-sm font-semibold text-blue-400">회로 통계</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">총 부품 수:</span>
            <span className="font-medium text-gray-200">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">연결 수:</span>
            <span className="font-medium text-gray-200">{edges.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
