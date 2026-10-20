import type { Metadata } from "next";
import { Barlow, Saira } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DesignSystemProviders } from "@/components/providers/design-system-providers";
import { CampaignSetupLeaveGuardProvider } from "@/contexts/campaign-setup-leave-guard";
import { ProductVersionProvider } from "@/contexts/product-version-context";
import { SessionProvider } from "@/contexts/session-context";
import { UiStyleProvider } from "@/contexts/ui-style-context";
import { UI_STYLE_BOOTSTRAP_SCRIPT } from "@/lib/ui-style";
import "@/styles/globals.css";

const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-saira",
});

/** Toolbox (Smart Marketing 2026) style typeface; see `data-ui-style`. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-barlow",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${saira.variable} ${barlow.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: UI_STYLE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <DesignSystemProviders>
          <UiStyleProvider>
            <NuqsAdapter>
              <SessionProvider>
                <ProductVersionProvider>
                  <CampaignSetupLeaveGuardProvider>
                    {children}
                  </CampaignSetupLeaveGuardProvider>
                </ProductVersionProvider>
              </SessionProvider>
            </NuqsAdapter>
          </UiStyleProvider>
        </DesignSystemProviders>
      </body>
    </html>
  );
}
