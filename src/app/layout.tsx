import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "CircuitPulse - AI 기반 전기회로 분석 시뮬레이터",
  description: "AI를 활용한 전기회로 분석, 오류 진단, 부품 최적화 및 실시간 시뮬레이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
