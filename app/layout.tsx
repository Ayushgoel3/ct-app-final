import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CT APP — Control Tower escalation tracker",
  description:
    "Collates escalations from Gmail, Slack and Sheets into buckets with owners, timelines and status.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
