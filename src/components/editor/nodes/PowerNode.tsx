"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { EditorNodeData } from "@/types/circuit";

function PowerNode({ data, selected }: NodeProps<EditorNodeData>) {
  return (
    <div
      className={`rounded-lg border-2 bg-gray-800 p-3 shadow-lg transition-all ${
        selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-600"
      }`}
    >
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-red-400" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-red-400" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-red-400" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-red-400" />
      
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl">⚡</div>
        <div className="text-xs font-semibold text-gray-200">{data.label}</div>
        {data.value && (
          <div className="text-xs text-red-400">
            {data.value}{data.unit}
          </div>
        )}
      </div>
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!bg-red-400" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!bg-red-400" />
    </div>
  );
}

export default memo(PowerNode);
