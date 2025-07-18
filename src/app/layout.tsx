import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "502 Whiteboard",
  description: "the whiteboard in room 502",
  icons: [
    { rel: "icon", url: "/favicon-96x96.png" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
