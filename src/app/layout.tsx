import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "502",
  description: "the whiteboard in room 502",
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
