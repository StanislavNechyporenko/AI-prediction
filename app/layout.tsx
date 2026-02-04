import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OddsPulse - Prediction Event Analyzer",
  description: "Analyze prediction market events with OpenAI."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
