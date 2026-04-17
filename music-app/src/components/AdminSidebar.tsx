import { Link, useLocation } from "wouter";
import { Upload, Music, Disc, MessageSquare, BarChart2, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminLogout, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart2 },
  { href: "/admin/upload", label: "Upload", icon: Upload },
  { href: "/admin/songs", label: "Songs", icon: Music },
  { href: "/admin/mixtapes", label: "Mixtapes", icon: Disc },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { username } = useAdmin();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
        setLocation("/admin/login");
      },
    });
  }

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Admin Panel</p>
        <p className="text-sm font-semibold mt-1">{username}</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                location === href
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid={`nav-admin-${label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </div>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <Home className="w-4 h-4" />
            Public Site
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
