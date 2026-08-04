import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Zap,
  Lightbulb,
  Search,
  FlaskConical,
  ClipboardList,
  Rocket,
  GitFork,
  CalendarCheck,
  CalendarRange,
} from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "S2C System",
  description: "Signal-to-Commitment personal opportunity system",
};

const NAV: Array<
  | { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
  | { type: "divider" }
> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "Signals", icon: Zap },
  { href: "/intents", label: "Intents", icon: Lightbulb },
  { href: "/explorations", label: "Explorations", icon: Search },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/candidates", label: "Candidates", icon: ClipboardList },
  { href: "/projects", label: "Projects", icon: Rocket },
  { type: "divider" },
  { href: "/graph", label: "Graph", icon: GitFork },
  { href: "/review/weekly", label: "Weekly Review", icon: CalendarCheck },
  { href: "/review/monthly", label: "Monthly Review", icon: CalendarRange },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen">
          <aside className="flex w-56 flex-col border-r border-gray-200 bg-gray-50/50">
            <div className="flex h-14 items-center border-b border-gray-200 px-4">
              <Link href="/" className="text-sm font-semibold text-gray-900">
                S2C System
              </Link>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {NAV.map((item, i) => {
                if ("type" in item && item.type === "divider") {
                  return <hr key={i} className="my-2 border-gray-200" />;
                }
                if (!("href" in item)) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
