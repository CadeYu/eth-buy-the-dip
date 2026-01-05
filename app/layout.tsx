import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETH Buy The Dip - Monitor",
  description: "Automated Ethereum accumulation strategy dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-black text-white">
        {children}
      </body>
    </html>
  );
}
