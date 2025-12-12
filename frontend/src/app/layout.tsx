import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Space_Grotesk({
    variable: "--font-display",
    subsets: ["latin"],
});

const mono = Fira_Code({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Castfash - AI Fashion Catalog Platform",
    description: "AI-powered fashion catalog generation platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${display.variable} ${mono.variable} antialiased`}
                suppressHydrationWarning
            >
                {children}
                <Toaster position="top-right" theme="dark" />
            </body>
        </html>
    );
}
