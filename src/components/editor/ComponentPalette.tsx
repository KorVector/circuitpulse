"use client";

import { DragEvent } from "react";
import type { PaletteComponent } from "@/types/circuit";

const paletteComponents: PaletteComponent[] = [
  { type: "battery", label: "전지", icon: "🔋", defaultValue: "9", defaultUnit: "V" },
  { type: "resistor", label: "저항", icon: "⚡", defaultValue: "220", defaultUnit: "Ω" },
  { type: "led", label: "LED", icon: "💡", defaultValue: "빨강", defaultUnit: "" },
  { type: "capacitor", label: "커패시터", icon: "🔌", defaultValue: "100", defaultUnit: "μF" },
  { type: "switch", label: "스위치", icon: "🔛", defaultValue: "", defaultUnit: "" },
  { type: "and-gate", label: "AND", icon: "⩓", defaultValue: "", defaultUnit: "" },
  { type: "or-gate", label: "OR", icon: "⩔", defaultValue: "", defaultUnit: "" },
  { type: "not-gate", label: "NOT", icon: "¬", defaultValue: "", defaultUnit: "" },
  { type: "ground", label: "GND", icon: "⏚", defaultValue: "", defaultUnit: "" },
  { type: "vcc", label: "VCC", icon: "⚡", defaultValue: "5", defaultUnit: "V" },
];

interface ComponentPaletteProps {
  onDragStart: (event: DragEvent, component: PaletteComponent) => void;
}

export default function ComponentPalette({ onDragStart }: ComponentPaletteProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">부품 팔레트</h2>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {paletteComponents.map((component) => (
          <div
            key={component.type}
            draggable
            onDragStart={(e) => onDragStart(e, component)}
            className="group flex cursor-grab items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3 transition-all hover:border-blue-500 hover:bg-gray-700 active:cursor-grabbing"
          >
            <div className="text-2xl">{component.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-200">{component.label}</div>
              <div className="text-xs text-gray-500">{component.type}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
        <p className="text-xs text-blue-300">
          💡 부품을 드래그하여 캔버스에 추가하세요
        </p>
      </div>
    </div>
  );
}
