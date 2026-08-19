import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하루의 선택",
  description: "특수교육용 상황별 일상 시뮬레이션 웹게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
