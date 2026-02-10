"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

function ReconstructedSwitchNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`rounded-lg border-2 bg-gray-800 p-3 shadow-lg transition-all ${
        selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-500"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl">🔘</div>
        <div className="text-xs font-semibold text-gray-200">{data.label}</div>
        {data.value && (
          <div className="text-xs text-gray-400">{data.value}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
    </div>
  );
}

export default memo(ReconstructedSwitchNode);
