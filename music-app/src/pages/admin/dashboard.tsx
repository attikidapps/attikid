import { useGetAnalyticsOverview } from "@workspace/api-client-react";
import AdminSidebar from "@/components/AdminSidebar";
import { Music, Disc, MessageSquare, TrendingUp, Play } from "lucide-react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ComponentType<any> }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5" data-testid={`stat-${label.toLowerCase().replace(/ /g, '-')}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: overview, isLoading } = useGetAnalyticsOverview();

  return (
    <div className="flex min-h-screen pt-0">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black mb-6">Dashboard</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total Plays" value={overview?.totalPlaysAllTime ?? 0} icon={Play} />
              <StatCard label="Plays This Week" value={overview?.totalPlaysThisWeek ?? 0} icon={TrendingUp} />
              <StatCard label="Songs" value={overview?.totalSongs ?? 0} icon={Music} />
              <StatCard label="Mixtapes" value={overview?.totalMixtapes ?? 0} icon={Disc} />
              <StatCard label="Comments" value={overview?.totalComments ?? 0} icon={MessageSquare} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Trending This Week</h2>
                <div className="space-y-2">
                  {(overview?.trendingThisWeek || []).map((s, i) => (
                    <Link key={s.id} href={`/songs/${s.id}`}>
                      <div className="flex items-center gap-3 py-1.5 hover:bg-secondary/50 rounded-lg px-2 transition-colors cursor-pointer">
                        <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.weekPlays} plays this week</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!overview?.trendingThisWeek?.length && <p className="text-muted-foreground text-sm">No data yet</p>}
                </div>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Play className="w-4 h-4 text-primary" /> All-Time Top Songs</h2>
                <div className="space-y-2">
                  {(overview?.topSongs || []).map((s, i) => (
                    <Link key={s.id} href={`/songs/${s.id}`}>
                      <div className="flex items-center gap-3 py-1.5 hover:bg-secondary/50 rounded-lg px-2 transition-colors cursor-pointer">
                        <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.totalPlays.toLocaleString()} plays</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!overview?.topSongs?.length && <p className="text-muted-foreground text-sm">No data yet</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
