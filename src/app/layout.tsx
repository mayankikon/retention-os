import type { Metadata } from "next";
import { Saira } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CampaignSetupLeaveGuardProvider } from "@/contexts/campaign-setup-leave-guard";
import { ProductVersionProvider } from "@/contexts/product-version-context";
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
          <SessionProvider>
            <ProductVersionProvider>
              <CampaignSetupLeaveGuardProvider>
                {children}
              </CampaignSetupLeaveGuardProvider>
            </ProductVersionProvider>
          </SessionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
