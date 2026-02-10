"use client";

import { AlertTriangle, Zap, Lightbulb, CheckCircle } from "lucide-react";
import type { SimulationResult } from "@/lib/simulation";

interface SimulationPanelProps {
  result: SimulationResult | null;
  isSimulating: boolean;
}

export default function SimulationPanel({ result, isSimulating }: SimulationPanelProps) {
  if (!isSimulating || !result) {
    return null;
  }

  const ledComponents = result.componentResults.filter(c => c.type === 'led');

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <h3 className="text-sm font-semibold text-green-400">시뮬레이션 실행 중</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Calculations */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-gray-200">회로 계산</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">총 전압:</span>
                <span className="font-medium text-blue-400">{result.totalVoltage.toFixed(1)}V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">총 저항:</span>
                <span className="font-medium text-yellow-400">{result.totalResistance.toFixed(1)}Ω</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">총 전류:</span>
                <span className="font-medium text-green-400">{result.totalCurrent.toFixed(1)}mA</span>
              </div>
            </div>
          </div>

          {/* LED Status */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-gray-200">LED 상태</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              {ledComponents.length === 0 ? (
                <p className="text-gray-500">LED가 없습니다</p>
              ) : (
                ledComponents.map((led) => (
                  <div key={led.nodeId} className="flex items-center justify-between">
                    <span className="text-gray-400">
                      {led.status === 'on' ? '💡' : led.status === 'warning' ? '⚠️' : '⚫'} {led.label}
                    </span>
                    <span className={`font-medium ${
                      led.status === 'on' ? 'text-green-400' : 
                      led.status === 'warning' ? 'text-orange-400' : 
                      'text-gray-500'
                    }`}>
                      {led.status === 'on' ? `ON (${led.current.toFixed(1)}mA)` : 
                       led.status === 'warning' ? '과전류' : 
                       'OFF'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warnings */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-gray-200">경고</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              {result.warnings.length === 0 ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>문제 없음</span>
                </div>
              ) : (
                result.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`rounded border p-2 ${
                      warning.severity === 'danger'
                        ? 'border-red-500/30 bg-red-500/10 text-red-300'
                        : 'border-orange-500/30 bg-orange-500/10 text-orange-300'
                    }`}
                  >
                    {warning.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
