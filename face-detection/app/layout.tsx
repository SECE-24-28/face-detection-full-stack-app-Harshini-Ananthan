import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Detection App",
  description: "Minimal face detection app with Next.js, Prisma, PostgreSQL, and GraphQL.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
