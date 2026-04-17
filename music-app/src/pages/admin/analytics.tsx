import { useGetAnalyticsOverview, useGetTopSongs, useGetTrending } from "@workspace/api-client-react";
import AdminSidebar from "@/components/AdminSidebar";
import { TrendingUp, Play, Music, Disc, MessageSquare } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: overview, isLoading } = useGetAnalyticsOverview();
  const { data: topSongs } = useGetTopSongs();
  const { data: trending } = useGetTrending();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-black mb-6">Analytics</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "All-Time Plays", value: overview?.totalPlaysAllTime ?? 0, Icon: Play },
                { label: "This Week", value: overview?.totalPlaysThisWeek ?? 0, Icon: TrendingUp },
                { label: "Total Songs", value: overview?.totalSongs ?? 0, Icon: Music },
                { label: "Mixtapes", value: overview?.totalMixtapes ?? 0, Icon: Disc },
                { label: "Comments", value: overview?.totalComments ?? 0, Icon: MessageSquare },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="bg-card border border-card-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Trending This Week</h2>
                <div className="space-y-3">
                  {(trending || []).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="h-1.5 bg-secondary rounded-full flex-1 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${trending?.[0]?.weekPlays ? (s.weekPlays / trending[0].weekPlays) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{s.weekPlays}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!trending?.length && <p className="text-muted-foreground text-sm">No data yet</p>}
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-xl p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Play className="w-4 h-4 text-primary" /> All-Time Top Songs</h2>
                <div className="space-y-3">
                  {(topSongs || []).slice(0, 10).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="h-1.5 bg-secondary rounded-full flex-1 overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded-full"
                              style={{ width: `${topSongs?.[0]?.totalPlays ? (s.totalPlays / topSongs[0].totalPlays) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{s.totalPlays.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!topSongs?.length && <p className="text-muted-foreground text-sm">No data yet</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
