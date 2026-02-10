"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  Brain,
  AlertTriangle,
  BookOpen,
  Package,
  Zap,
  ArrowRight,
  Pencil,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: "회로도 업로드 & 손그림 인식",
      description: "손으로 그린 회로도나 스캔한 이미지를 업로드하면 AI가 자동으로 인식합니다.",
    },
    {
      icon: Pencil,
      title: "CAD 스타일 회로 에디터",
      description: "마우스로 직접 회로를 그리고 편집할 수 있는 직관적인 CAD 에디터를 제공합니다.",
    },
    {
      icon: Brain,
      title: "AI 회로 분석",
      description: "GPT-4o Vision이 회로를 분석하여 구성요소, 연결, 전기적 특성을 파악합니다.",
    },
    {
      icon: AlertTriangle,
      title: "오류 감지 & 위험성 경고",
      description: "단락, 과전류, 부품 손상 등 잠재적 위험을 사전에 감지하고 경고합니다.",
    },
    {
      icon: BookOpen,
      title: '"왜 안 되는지" 인과관계 설명',
      description: "회로가 작동하지 않는 이유를 인과관계와 함께 쉽게 설명해드립니다.",
    },
    {
      icon: Package,
      title: "현실 부품 수급 & 대체 제안",
      description: "보유 부품으로 회로를 구성하거나 대체 가능한 부품을 추천받으세요.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-800 px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container relative mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2">
            <Zap className="h-5 w-5 animate-pulse-glow text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              AI 기반 회로 분석 플랫폼
            </span>
          </div>
          
          <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
            CircuitGuide
          </h1>
          
          <p className="mb-8 text-lg text-gray-300 sm:text-xl">
            AI를 활용한 전기회로 분석, 오류 진단, 부품 최적화 및 실시간 시뮬레이션
            <br />
            복잡한 회로도 손쉽게 분석하고 완벽하게 이해하세요
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/analyze"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 sm:w-auto"
            >
              회로 분석 시작하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/editor"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500/10 px-6 py-3 font-semibold text-blue-400 transition-all hover:bg-blue-500/20 sm:w-auto"
            >
              회로 에디터
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/simulate"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 font-semibold text-gray-300 transition-all hover:border-blue-500 hover:text-blue-400 sm:w-auto"
            >
              시뮬레이션 체험
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              핵심 기능
            </h2>
            <p className="text-lg text-gray-400">
              CircuitGuide가 제공하는 강력한 기능들을 만나보세요
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-blue-500/50 hover:bg-gray-900/80"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-800 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            지금 바로 시작하세요
          </h2>
          <p className="mb-8 text-lg text-gray-400">
            회로도를 업로드하거나 직접 에디터로 회로를 그려서 CircuitGuide를 경험해보세요
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/analyze"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 sm:w-auto"
            >
              회로 분석하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/editor"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-500/10 px-8 py-4 text-lg font-semibold text-blue-400 transition-all hover:bg-blue-500/20 sm:w-auto"
            >
              회로 에디터
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
