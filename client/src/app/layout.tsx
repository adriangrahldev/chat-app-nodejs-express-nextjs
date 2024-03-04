import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/hooks/session";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat Room App",
  description: "A real-time chat application built with Next.js, Node.js, and Socket.io",
  authors: [
    {name: "Adrian Grahl", url: "https://github.com/adriangrahldev"},
  ],
  keywords: ["next.js", "socket.io", "real-time", "chat", "application"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={inter.className}>
        
      <SessionProvider>
        {children}
        </SessionProvider>
        </body>
    </html>
  );
}
