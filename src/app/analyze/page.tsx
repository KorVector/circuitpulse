"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { Upload, Loader2, AlertTriangle, XCircle, Info, Edit3 } from "lucide-react";
import type { CircuitAnalysis } from "@/types/circuit";
import { useRouter } from "next/navigation";
import ReconstructedBatteryNode from "@/components/analyze/nodes/ReconstructedBatteryNode";
import ReconstructedResistorNode from "@/components/analyze/nodes/ReconstructedResistorNode";
import ReconstructedLEDNode from "@/components/analyze/nodes/ReconstructedLEDNode";
import ReconstructedCapacitorNode from "@/components/analyze/nodes/ReconstructedCapacitorNode";
import ReconstructedSwitchNode from "@/components/analyze/nodes/ReconstructedSwitchNode";
import ReconstructedGateNode from "@/components/analyze/nodes/ReconstructedGateNode";
import ReconstructedGroundNode from "@/components/analyze/nodes/ReconstructedGroundNode";
import ReconstructedPowerNode from "@/components/analyze/nodes/ReconstructedPowerNode";

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

function ReconstructedCircuitSection({ circuit }: { circuit: CircuitAnalysis["reconstructedCircuit"] }) {
  const router = useRouter();
  
  // Convert reconstructed nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!circuit) return [];
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
  }, [circuit]);

  // Convert reconstructed edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!circuit) return [];
    return circuit.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: "#60a5fa" },
    }));
  }, [circuit]);

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const openInEditor = () => {
    if (!circuit) return;
    
    // Type mapping: and_gate → and-gate etc.
    const typeMap: Record<string, string> = {
      battery: "battery",
      resistor: "resistor",
      led: "led",
      capacitor: "capacitor",
      switch: "switch",
      and_gate: "and-gate",
      or_gate: "or-gate",
      not_gate: "not-gate",
      ground: "ground",
      power: "vcc",
    };
    
    const iconMap: Record<string, string> = {
      battery: "🔋",
      resistor: "⚡",
      led: "💡",
      capacitor: "🔌",
      switch: "🔘",
      "and-gate": "🔲",
      "or-gate": "🔲",
      "not-gate": "🔲",
      ground: "⏚",
      vcc: "⚡",
    };
    
    // Convert AI nodes to React Flow nodes with proper types
    const rfNodes = circuit.nodes.map((node) => {
      const mappedType = typeMap[node.type] || "resistor";
      return {
        id: node.id,
        type: mappedType,
        position: node.position,
        data: {
          label: node.label,
          type: mappedType,
          value: node.value,
          unit: "",
          icon: iconMap[mappedType] || "⚡",
        },
      };
    });
    
    const rfEdges = circuit.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: "#60a5fa" },
    }));
    
    localStorage.setItem("circuitpulse-reconstructed", JSON.stringify({ nodes: rfNodes, edges: rfEdges }));
    router.push("/editor");
  };

  if (!circuit) return null;

  return (
    <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
        <span className="text-2xl">🔧</span> AI가 개선한 회로도
      </h2>
      
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* React Flow Editor */}
        <div className="rounded-xl border border-gray-800 bg-gray-900" style={{ height: "500px" }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-900"
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
              <Controls className="!border-gray-700 !bg-gray-800 [&_button]:!border-gray-700 [&_button]:!bg-gray-800 [&_button]:!fill-gray-300 hover:[&_button]:!bg-gray-700" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {/* Improvements List */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-400">
              <span className="text-lg">✅</span> 개선사항 목록
            </h3>
            {circuit.improvements && circuit.improvements.length > 0 && (
              <ul className="space-y-2">
                {circuit.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed text-gray-300">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {circuit.description && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
              <h3 className="mb-2 text-sm font-semibold text-blue-400">회로 설명</h3>
              <p className="text-xs leading-relaxed text-gray-300">{circuit.description}</p>
            </div>
          )}
          
          <button
            onClick={openInEditor}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600"
          >
            <Edit3 className="h-5 w-5" />
            에디터에서 열기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [image, setImage] = useState<string | null>(null);
  const [availableParts, setAvailableParts] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [analysis, setAnalysis] = useState<CircuitAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  
  const SUMMARY_COLLAPSE_THRESHOLD = 300;

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const validateAnalysis = (data: any, depth = 0): CircuitAnalysis => {
    // 무한 재귀 방지: 최대 깊이 3으로 제한
    const MAX_DEPTH = 3;
    
    // data.summary가 JSON 텍스트로 보이면 파싱 시도
    // (API가 JSON을 문자열로 감싸서 반환하는 경우 처리)
    if (depth < MAX_DEPTH && typeof data.summary === 'string' && data.summary.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(data.summary);
        if (parsed.summary) {
          return validateAnalysis(parsed, depth + 1);
        }
      } catch {
        // JSON 파싱 실패는 무시하고 원본 데이터를 사용
      }
    }
    
    return {
      summary: typeof data.summary === 'string' ? data.summary : '분석 결과를 불러오는 중 오류가 발생했습니다.',
      components: Array.isArray(data.components) ? data.components : [],
      errors: Array.isArray(data.errors) ? data.errors : [],
      calculations: Array.isArray(data.calculations) ? data.calculations : [],
      alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
      causalExplanations: Array.isArray(data.causalExplanations) ? data.causalExplanations : [],
      realWorldFactors: Array.isArray(data.realWorldFactors) ? data.realWorldFactors : [],
      dangerWarnings: Array.isArray(data.dangerWarnings) ? data.dangerWarnings : [],
      optimizations: Array.isArray(data.optimizations) ? data.optimizations : [],
      reconstructedCircuit: data.reconstructedCircuit || undefined,
      userAnswer: typeof data.userAnswer === 'string' ? data.userAnswer : undefined,
    };
  };

  const analyzeCircuit = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          availableParts: availableParts.trim(),
          userQuestion: userQuestion.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("분석 중 오류가 발생했습니다");
      }

      const data = await response.json();
      
      // 방어 로직: data가 올바른 구조인지 검증
      const validatedAnalysis = validateAnalysis(data);
      setAnalysis(validatedAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 border-red-500/50 bg-red-500/10";
      case "error":
        return "text-orange-400 border-orange-500/50 bg-orange-500/10";
      case "warning":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      default:
        return "text-blue-400 border-blue-500/50 bg-blue-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white">회로 분석</h1>
          <p className="text-lg text-gray-400">
            회로도 이미지를 업로드하면 AI가 자동으로 분석합니다
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                회로도 업로드
              </h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative mb-4 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 p-8 transition-all hover:border-blue-500"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                
                {image ? (
                  <img
                    src={image}
                    alt="Uploaded circuit"
                    className="max-h-[280px] rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-gray-500 group-hover:text-blue-400" />
                    <p className="mb-2 text-sm font-medium text-gray-300">
                      클릭하거나 파일을 드래그하세요
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG 형식 지원
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  📦 보유 부품 목록 (선택사항)
                </label>
                <textarea
                  value={availableParts}
                  onChange={(e) => setAvailableParts(e.target.value)}
                  placeholder="예: 저항 220Ω, 저항 1kΩ, LED 빨강, 건전지 9V"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  ❓ 궁금한 점 (선택사항)
                </label>
                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="예: 이 회로에서 LED의 밝기를 조절하려면 어떻게 해야 하나요?"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <button
                onClick={analyzeCircuit}
                disabled={!image || loading}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    분석 중...
                  </span>
                ) : (
                  "회로 분석하기"
                )}
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">분석 결과</h2>
            
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {!analysis && !loading && !error && (
              <div className="flex min-h-[600px] items-center justify-center text-gray-500">
                <div className="text-center">
                  <Info className="mx-auto mb-4 h-12 w-12" />
                  <p>회로도를 업로드하고 분석 버튼을 클릭하세요</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[600px] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
              </div>
            )}

            {analysis && (
              <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-400">
                      <span className="text-lg">📋</span> 종합 분석
                    </h3>
                    {analysis.summary.length > SUMMARY_COLLAPSE_THRESHOLD ? (
                      <>
                        <p className="text-sm leading-relaxed text-gray-300">
                          {showFullSummary ? analysis.summary : analysis.summary.substring(0, SUMMARY_COLLAPSE_THRESHOLD) + "..."}
                        </p>
                        <button
                          onClick={() => setShowFullSummary(!showFullSummary)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {showFullSummary ? "접기" : "더 보기"}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed text-gray-300">{analysis.summary}</p>
                    )}
                  </div>

                  {/* Danger Warnings */}
                  {analysis.dangerWarnings && analysis.dangerWarnings.length > 0 && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/20 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-lg">⚠️</span> 위험 경고
                      </h3>
                      <div className="space-y-3">
                        {analysis.dangerWarnings.map((warning, idx) => (
                          <div key={idx} className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                            <p className="mb-1 text-sm font-medium text-red-300">
                              {warning.type} ({warning.severity})
                            </p>
                            <p className="mb-2 text-xs leading-relaxed text-gray-300">{warning.description}</p>
                            <p className="text-xs text-gray-400">
                              <strong>주의사항:</strong> {warning.precaution}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Components */}
                  {analysis.components && analysis.components.length > 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-400">
                        <span className="text-lg">🔍</span> 인식된 부품
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {analysis.components.map((comp, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-sm">
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
                  {analysis.errors && analysis.errors.length > 0 && (
                    <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-orange-400">
                        <span className="text-lg">🔴</span> 오류 진단 (왜 틀린지)
                      </h3>
                      <div className="space-y-3">
                        {analysis.errors.map((error, idx) => (
                          <div key={idx} className={`rounded-lg border p-3 ${getSeverityColor(error.severity)}`}>
                            <p className="mb-1 text-sm font-medium">{error.type}</p>
                            <p className="text-xs leading-relaxed opacity-90">{error.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculations */}
                  {analysis.calculations && analysis.calculations.length > 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-green-400">
                        <span className="text-lg">📊</span> 회로 계산
                      </h3>
                      <div className="space-y-2">
                        {analysis.calculations.map((calc, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-sm">
                            <span className="text-gray-300">{calc.parameter}</span>
                            <span className="font-medium text-green-400">
                              {calc.value} {calc.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Causal Explanations */}
                  {analysis.causalExplanations && analysis.causalExplanations.length > 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-purple-400">
                        <span className="text-lg">🔗</span> 인과관계 설명
                      </h3>
                      <div className="space-y-3">
                        {analysis.causalExplanations.map((explanation, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                            <p className="mb-2 text-sm font-medium text-purple-300">
                              {explanation.issue}
                            </p>
                            <div className="space-y-1 text-xs leading-relaxed text-gray-400">
                              <p><strong>원인:</strong> {explanation.cause}</p>
                              <p><strong>결과:</strong> {explanation.effect}</p>
                              <p><strong>해결:</strong> {explanation.solution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternatives */}
                  {analysis.alternatives && analysis.alternatives.length > 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-cyan-400">
                        <span className="text-lg">🔄</span> 대체 부품 제안
                      </h3>
                      <div className="space-y-3">
                        {analysis.alternatives.map((alt, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                            <p className="mb-2 text-sm font-medium text-cyan-300">
                              {alt.original}
                            </p>
                            <p className="mb-1 text-xs leading-relaxed text-gray-300">
                              대체 가능: {alt.alternatives.join(", ")}
                            </p>
                            <p className="text-xs text-gray-400">{alt.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real World Factors */}
                  {analysis.realWorldFactors && analysis.realWorldFactors.length > 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-yellow-400">
                        <span className="text-lg">🌐</span> 현실 변수
                      </h3>
                      <div className="space-y-3">
                        {analysis.realWorldFactors.map((factor, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-sm">
                            <p className="mb-1 font-medium text-yellow-300">{factor.factor}</p>
                            <p className="mb-1 text-xs leading-relaxed text-gray-300">{factor.impact}</p>
                            {factor.recommendation && (
                              <p className="text-xs text-gray-400">
                                권장: {factor.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimizations */}
                  {analysis.optimizations && analysis.optimizations.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-400">
                        <span className="text-lg">⚡</span> 최적화 제안
                      </h3>
                      <div className="space-y-3">
                        {analysis.optimizations.map((opt, idx) => (
                          <div key={idx} className="rounded-lg border border-emerald-500/20 bg-gray-800/50 p-3">
                            <p className="mb-1 text-sm font-medium text-emerald-300">{opt.area}</p>
                            <p className="mb-1 text-xs leading-relaxed text-gray-300">{opt.suggestion}</p>
                            <p className="text-xs text-gray-400">기대효과: {opt.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Answer */}
                  {analysis.userAnswer && (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-400">
                        <span className="text-lg">💬</span> 궁금한 점에 대한 답변
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-300">{analysis.userAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reconstructed Circuit Section (Full Width Below) */}
        {analysis?.reconstructedCircuit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ReconstructedCircuitSection circuit={analysis.reconstructedCircuit} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
