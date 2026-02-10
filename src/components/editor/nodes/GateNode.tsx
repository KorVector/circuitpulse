"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { EditorNodeData } from "@/types/circuit";

function GateNode({ data, selected }: NodeProps<EditorNodeData>) {
  const getGateSymbol = () => {
    switch (data.type) {
      case "and-gate":
        return "⩓";
      case "or-gate":
        return "⩔";
      case "not-gate":
        return "¬";
      default:
        return "⚡";
    }
  };

  return (
    <div
      className={`rounded-lg border-2 bg-gray-800 p-3 shadow-lg transition-all ${
        selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-600"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      {data.type !== "not-gate" && (
        <Handle
          type="target"
          position={Position.Left}
          id="input2"
          className="!bg-blue-400"
          style={{ top: "70%" }}
        />
      )}
      
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl">{getGateSymbol()}</div>
        <div className="text-xs font-semibold text-gray-200">{data.label}</div>
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
    </div>
  );
}

export default memo(GateNode);
