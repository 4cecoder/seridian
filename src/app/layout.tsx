import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Seridian | Cloud Infrastructure & Application Development Consulting",
  description:
    "Seridian helps organizations design, build, and scale cloud infrastructure and modern applications. Expert consulting for AWS, Azure, GCP, and full-stack development.",
  keywords: [
    "cloud consulting",
    "infrastructure consulting",
    "application development",
    "AWS",
    "Azure",
    "GCP",
    "DevOps",
    "cloud architecture",
  ],
  openGraph: {
    title: "Seridian | Cloud & Application Consulting",
    description:
      "Expert cloud infrastructure and application development consulting for modern organizations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
