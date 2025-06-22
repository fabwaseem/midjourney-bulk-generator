import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/lib/settings-context";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Midjourney Bulk Generator - AI Image Generation Tool",
    template: "%s | Midjourney Bulk Generator",
  },
  description:
    "Generate multiple AI images with Midjourney bulk generator. Create, upscale, and enhance artwork in batches using advanced AI technology. Free bulk image generation tool for artists and creators.",
  keywords: [
    "Midjourney",
    "midjourney bulk generator",
    "AI image generator",
    "artificial intelligence",
    "image generation",
    "AI art",
    "digital art",
    "creative tools",
    "image upscaling",
    "AI enhancement",
    "art creation",
    "generative AI",
    "digital artwork",
  ],
  authors: [{ name: "Waseem Anjum", url: "https://waseemanjum.vercel.app/" }],
  creator: "Waseem Anjum",
  publisher: "Midjourney Bulk Generator",
  metadataBase: new URL("https://midjourney-bulk-generator.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://midjourney-bulk-generator.vercel.app",
    title: "Midjourney Bulk Generator - AI Image Generation Tool",
    description:
      "Generate multiple AI images with Midjourney bulk generator. Create, upscale, and enhance artwork in batches using advanced AI technology.",
    siteName: "Midjourney Bulk Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midjourney Bulk Generator - AI Image Generation Tool",
    description:
      "Generate multiple AI images with Midjourney bulk generator. Create, upscale, and enhance artwork in batches using advanced AI technology.",
    creator: "@fabwaseeem",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "technology",
  classification: "AI Image Generation Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} gradient-bg font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <Navbar />
            <main className="p-4  flex-1">{children}</main>
            <footer className="py-4 text-center text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                Made with <span className="text-red-500 animate-pulse">❤️</span>{" "}
                by{" "}
                <a
                  href="https://waseemanjum.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors duration-200"
                >
                  Waseem Anjum
                </a>
              </p>
            </footer>
            <Toaster
              position="top-center"
              toastOptions={{
                // Define default options
                duration: 5000,
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                },
                // Default options for specific types
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "white",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
                loading: {
                  duration: Infinity,
                },
              }}
            />
            <GoogleAnalytics gaId="G-QJ4X73944P" />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
