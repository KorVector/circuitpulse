"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { EditorNodeData } from "@/types/circuit";

function LEDNode({ data, selected }: NodeProps<EditorNodeData>) {
  const simulationStatus = data.simulationStatus || 'normal';
  
  // Determine styling based on simulation status
  let nodeStyle = "rounded-lg border-2 bg-gray-800 p-3 shadow-lg transition-all";
  
  if (selected) {
    nodeStyle += " border-blue-500 shadow-blue-500/50";
  } else if (simulationStatus === 'on') {
    // LED is on - glowing effect
    nodeStyle += " border-yellow-400 shadow-yellow-400/50 bg-yellow-900/30";
  } else if (simulationStatus === 'warning') {
    // Warning - red pulsing effect
    nodeStyle += " border-red-500 shadow-red-500/50 animate-pulse";
  } else {
    nodeStyle += " border-gray-600";
  }
  
  return (
    <div className={nodeStyle}>
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-blue-400" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-blue-400" />
      
      <div className="flex flex-col items-center gap-1">
        <div className={`text-2xl ${simulationStatus === 'on' ? 'brightness-150' : ''}`}>
          {data.icon || "💡"}
        </div>
        <div className="text-xs font-semibold text-gray-200">{data.label}</div>
        {data.value && (
          <div className="text-xs text-red-400">
            {data.value}{data.unit}
          </div>
        )}
        {simulationStatus === 'on' && data.simulationCurrent !== undefined && (
          <div className="text-xs text-yellow-400">
            {data.simulationCurrent.toFixed(1)}mA
          </div>
        )}
      </div>
      
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-blue-400" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-blue-400" />
    </div>
  );
}

export default memo(LEDNode);
