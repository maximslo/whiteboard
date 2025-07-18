import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "502 Whiteboard",
  description: "the whiteboard in room 502",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicons & Manifest */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
