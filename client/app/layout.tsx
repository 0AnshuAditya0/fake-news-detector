import type { Metadata } from "next";
import { Space_Grotesk, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const dmSerifDisplay = DM_Serif_Display({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Editorial Precision News Detector v4",
  description:
    "A high-fidelity analysis engine designed to dissect misinformation with editorial precision and scientific rigor.",
  keywords: ["fake news", "fact check", "misinformation", "AI", "editorial precision"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} bg-background-light text-ink font-display antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
