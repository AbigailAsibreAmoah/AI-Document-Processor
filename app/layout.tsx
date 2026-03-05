import type { Metadata } from "next";
import { AuthProvider } from '../lib/auth-context';
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Document Processor",
  description: "AI-powered document processing application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
