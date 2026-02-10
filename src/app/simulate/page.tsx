"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Battery, Zap, CircleDot, Component, ToggleLeft, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { CircuitComponent, ComponentType } from "@/types/circuit";

interface SimulationResult {
  totalCurrent: number;
  totalVoltage: number;
  totalResistance: number;
  totalPower: number;
  warnings: string[];
}

export default function SimulatePage() {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const componentPalette: { type: ComponentType; icon: any; label: string; defaultValue: string }[] = [
    { type: "battery", icon: Battery, label: "전지", defaultValue: "9V" },
    { type: "resistor", icon: Component, label: "저항", defaultValue: "220Ω" },
    { type: "led", icon: CircleDot, label: "LED", defaultValue: "2V" },
    { type: "capacitor", icon: Zap, label: "커패시터", defaultValue: "100μF" },
    { type: "switch", icon: ToggleLeft, label: "스위치", defaultValue: "ON" },
  ];

  const addComponent = (type: ComponentType, defaultValue: string, label: string) => {
    const newComponent: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type,
      value: defaultValue,
      label,
    };
    setComponents([...components, newComponent]);
    setResult(null);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    setResult(null);
  };

  const updateComponentValue = (id: string, value: string) => {
    setComponents(
      components.map((c) => (c.id === id ? { ...c, value } : c))
    );
    setResult(null);
  };

  const simulate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ components }),
      });

      if (!response.ok) {
        throw new Error("시뮬레이션 중 오류가 발생했습니다");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Simulation error:", error);
      setResult({
        totalCurrent: 0,
        totalVoltage: 0,
        totalResistance: 0,
        totalPower: 0,
        warnings: ["시뮬레이션 중 오류가 발생했습니다"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white">회로 시뮬레이션</h1>
          <p className="text-lg text-gray-400">
            부품을 추가하고 가상 회로를 구성하여 시뮬레이션하세요
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Circuit Builder */}
          <div className="space-y-6">
            {/* Component Palette */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
            >
              <h2 className="mb-4 text-xl font-semibold text-white">부품 팔레트</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {componentPalette.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addComponent(item.type, item.defaultValue, item.label)}
                    className="group flex flex-col items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 p-4 transition-all hover:border-blue-500 hover:bg-gray-800/80"
                  >
                    <item.icon className="h-6 w-6 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-blue-400">
                      {item.label}
                    </span>
                    <Plus className="h-4 w-4 text-gray-500 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Component List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
            >
              <h2 className="mb-4 text-xl font-semibold text-white">회로 부품</h2>
              
              {components.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-gray-500">
                  <p>부품을 추가하여 회로를 구성하세요</p>
                </div>
              ) : (
                <div className="scrollbar-thin max-h-[400px] space-y-3 overflow-y-auto">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3"
                    >
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-medium text-gray-300">
                          {component.label}
                        </p>
                        <input
                          type="text"
                          value={component.value}
                          onChange={(e) => updateComponentValue(component.id, e.target.value)}
                          className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                          placeholder="값 입력"
                        />
                      </div>
                      <button
                        onClick={() => removeComponent(component.id)}
                        className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={simulate}
                disabled={components.length === 0 || loading}
                className="mt-4 w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    시뮬레이션 중...
                  </span>
                ) : (
                  "시뮬레이션 실행"
                )}
              </button>
            </motion.div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">시뮬레이션 결과</h2>
            
            {!result && !loading && (
              <div className="flex min-h-[400px] items-center justify-center text-gray-500">
                <div className="text-center">
                  <Zap className="mx-auto mb-4 h-12 w-12" />
                  <p>부품을 추가하고 시뮬레이션을 실행하세요</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-yellow-400">
                      <AlertTriangle className="h-5 w-5" />
                      경고
                    </h3>
                    <ul className="space-y-1">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-yellow-300">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Results Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <p className="mb-1 text-sm text-gray-400">총 전압</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {result.totalVoltage.toFixed(2)} V
                    </p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <p className="mb-1 text-sm text-gray-400">총 전류</p>
                    <p className="text-2xl font-bold text-green-400">
                      {result.totalCurrent.toFixed(4)} A
                    </p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <p className="mb-1 text-sm text-gray-400">총 저항</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {result.totalResistance.toFixed(2)} Ω
                    </p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <p className="mb-1 text-sm text-gray-400">총 전력</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {result.totalPower.toFixed(4)} W
                    </p>
                  </div>
                </div>

                {/* Formulas */}
                <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-300">사용된 공식</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• 옴의 법칙: V = I × R</p>
                    <p>• 전력: P = V × I</p>
                    <p>• 직렬 연결: R_total = R₁ + R₂ + ...</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
