import { Link, useLocation } from "wouter";
import { Music2, TrendingUp, Library, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/library", label: "Library" },
    { href: "/trending", label: "Trending" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[hsl(0,0%,4%)/95] backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Music2 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">WAVSTREAM</span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  location === href
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {label}
              </span>
            </Link>
          ))}
          <Link href="/admin">
            <span className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
              Admin
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
