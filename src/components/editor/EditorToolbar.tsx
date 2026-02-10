"use client";

import { FileText, Brain, Play, RotateCcw, RotateCw, Trash2 } from "lucide-react";

interface EditorToolbarProps {
  onNew: () => void;
  onAnalyze: () => void;
  onSimulate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
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
        className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
      >
        <Play className="h-4 w-4" />
        시뮬레이션
      </button>
    </div>
  );
}
