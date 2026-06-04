import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider } from "@/contexts/session-context";
import "@/styles/globals.css";

const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-saira",
});

export const metadata: Metadata = {
  title: "Smart Marketing Campaign Manager | Ikon",
  description:
    "Manage marketing campaigns, filters, and campaign setup for Ikon dealerships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${saira.variable} h-full antialiased`}>
      <body className={`${saira.className} min-h-full flex flex-col font-sans`}>
        <NuqsAdapter>
          <SessionProvider>{children}</SessionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
