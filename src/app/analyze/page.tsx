"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, AlertTriangle, CheckCircle, XCircle, Info, Edit3 } from "lucide-react";
import type { CircuitAnalysis } from "@/types/circuit";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [availableParts, setAvailableParts] = useState("");
  const [analysis, setAnalysis] = useState<CircuitAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }),
      });

      if (!response.ok) {
        throw new Error("분석 중 오류가 발생했습니다");
      }

      const data = await response.json();
      setAnalysis(data);
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

  const openInEditor = () => {
    if (!analysis) return;
    
    // Save analysis data to localStorage
    localStorage.setItem("editorAnalysisData", JSON.stringify(analysis));
    
    // Navigate to editor
    router.push("/editor");
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="container mx-auto max-w-6xl">
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
                  보유 부품 목록 (선택사항)
                </label>
                <textarea
                  value={availableParts}
                  onChange={(e) => setAvailableParts(e.target.value)}
                  placeholder="예: 저항 220Ω, 저항 1kΩ, LED 빨강, 건전지 9V"
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
              <div className="flex min-h-[400px] items-center justify-center text-gray-500">
                <div className="text-center">
                  <Info className="mx-auto mb-4 h-12 w-12" />
                  <p>회로도를 업로드하고 분석 버튼을 클릭하세요</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
              </div>
            )}

            {analysis && (
              <div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto">
                {/* Open in Editor Button */}
                <button
                  onClick={openInEditor}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
                >
                  <Edit3 className="h-4 w-4" />
                  에디터에서 열기
                </button>

                {/* Summary */}
                <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-400">종합 분석</h3>
                  <p className="text-sm text-gray-300">{analysis.summary}</p>
                </div>

                {/* Danger Warnings */}
                {analysis.dangerWarnings && analysis.dangerWarnings.length > 0 && (
                  <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      위험 경고
                    </h3>
                    <div className="space-y-2">
                      {analysis.dangerWarnings.map((warning, idx) => (
                        <div key={idx} className="rounded border border-red-500/30 bg-red-500/5 p-3">
                          <p className="mb-1 text-sm font-medium text-red-300">
                            {warning.type} ({warning.severity})
                          </p>
                          <p className="mb-2 text-xs text-gray-300">{warning.description}</p>
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
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-blue-400">인식된 부품</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {analysis.components.map((comp, idx) => (
                        <div key={idx} className="rounded border border-gray-700 bg-gray-900/50 p-2 text-sm">
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
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-orange-400">오류 진단</h3>
                    <div className="space-y-2">
                      {analysis.errors.map((error, idx) => (
                        <div key={idx} className={`rounded border p-3 ${getSeverityColor(error.severity)}`}>
                          <p className="mb-1 text-sm font-medium">{error.type}</p>
                          <p className="text-xs opacity-90">{error.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculations */}
                {analysis.calculations && analysis.calculations.length > 0 && (
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-green-400">회로 계산</h3>
                    <div className="space-y-2">
                      {analysis.calculations.map((calc, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded border border-gray-700 bg-gray-900/50 p-2 text-sm">
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
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-purple-400">인과관계 설명</h3>
                    <div className="space-y-3">
                      {analysis.causalExplanations.map((explanation, idx) => (
                        <div key={idx} className="rounded border border-gray-700 bg-gray-900/50 p-3">
                          <p className="mb-2 text-sm font-medium text-purple-300">
                            {explanation.issue}
                          </p>
                          <div className="space-y-1 text-xs text-gray-400">
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
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-cyan-400">대체 부품 제안</h3>
                    <div className="space-y-2">
                      {analysis.alternatives.map((alt, idx) => (
                        <div key={idx} className="rounded border border-gray-700 bg-gray-900/50 p-3">
                          <p className="mb-2 text-sm font-medium text-cyan-300">
                            {alt.original}
                          </p>
                          <p className="mb-1 text-xs text-gray-300">
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
                  <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <h3 className="mb-3 font-semibold text-yellow-400">현실 변수</h3>
                    <div className="space-y-2">
                      {analysis.realWorldFactors.map((factor, idx) => (
                        <div key={idx} className="rounded border border-gray-700 bg-gray-900/50 p-3 text-sm">
                          <p className="mb-1 font-medium text-yellow-300">{factor.factor}</p>
                          <p className="mb-1 text-xs text-gray-300">{factor.impact}</p>
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
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
