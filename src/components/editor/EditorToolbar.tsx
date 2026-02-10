"use client";

import { FileText, Brain, Play, Square, RotateCcw, RotateCw, Trash2 } from "lucide-react";

interface EditorToolbarProps {
  onNew: () => void;
  onAnalyze: () => void;
  onSimulate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  isSimulating?: boolean;
}

export default function EditorToolbar({
  onNew,
  onAnalyze,
  onSimulate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  isSimulating = false,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-3">
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
      >
        <FileText className="h-4 w-4" />
        새로 만들기
      </button>
      
      <div className="mx-2 h-6 w-px bg-gray-700" />
      
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw className="h-4 w-4" />
        되돌리기
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCw className="h-4 w-4" />
        다시하기
      </button>
      
      <div className="mx-2 h-6 w-px bg-gray-700" />
      
      <button
        onClick={onClear}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-red-500 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
        전체 삭제
      </button>
      
      <div className="flex-1" />
      
      <button
        onClick={onAnalyze}
        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
      >
        <Brain className="h-4 w-4" />
        AI 분석 요청
      </button>
      
      <button
        onClick={onSimulate}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          isSimulating
            ? "border border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "border border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20"
        }`}
      >
        {isSimulating ? (
          <>
            <Square className="h-4 w-4" />
            시뮬레이션 중지
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            시뮬레이션
          </>
        )}
      </button>
    </div>
  );
}
