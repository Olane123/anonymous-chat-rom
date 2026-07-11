import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab-sans",
  weight: "600",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Anonymous chat rom"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${robotoSlab.variable} h-full antialiased`}
    >
    <head>
      <title></title>
    </head>

    <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
