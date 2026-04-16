import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeCanvas",
  description: "Turn one product idea into a usable first draft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen w-full overflow-x-hidden">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
