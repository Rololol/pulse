import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pulse — Nachrichten, die Zusammenhänge sichtbar machen",
    template: "%s | Pulse",
  },
  description:
    "Unabhängige Nachrichten. Einordnung statt Aufregung. Journalismus, den Menschen freiwillig möglich machen.",
  applicationName: "Pulse",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}