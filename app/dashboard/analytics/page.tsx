import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReviewsChart from "./components/ReviewsChart";
import type { Review } from "@/app/dashboard/types";

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildWeeklyData(reviews: Review[]) {
  const map: Record<
    string,
    { week: string; approved: number; flagged: number }
  > = {};

  reviews.forEach((r) => {
    const week = getWeekLabel(r.created_at);
    if (!map[week]) map[week] = { week, approved: 0, flagged: 0 };
    if (r.review_text?.includes("APPROVE")) {
      map[week].approved++;
    } else {
      map[week].flagged++;
    }
  });

  return Object.values(map).slice(-8); // last 8 weeks
}

function buildRepoStats(reviews: Review[]) {
  const map: Record<string, { repo: string; total: number; flagged: number }> =
    {};

  reviews.forEach((r) => {
    if (!map[r.repo]) map[r.repo] = { repo: r.repo, total: 0, flagged: 0 };
    map[r.repo].total++;
    if (!r.review_text?.includes("APPROVE")) map[r.repo].flagged++;
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const allReviews = (reviews ?? []) as Review[];

  const total = allReviews.length;
  const approved = allReviews.filter((r) =>
    r.review_text?.includes("APPROVE"),
  ).length;
  const flagged = total - approved;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const weeklyData = buildWeeklyData(allReviews);
  const repoStats = buildRepoStats(allReviews);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-white/50 text-sm mt-1">
              Your code review insights
            </p>
          </div>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              ← Dashboard
            </Button>
          </Link>
        </div>

        {/* Approval rate hero */}
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-white/50 text-sm">Approval Rate</p>
                <span className="text-6xl font-bold text-green-400">
                  {approvalRate}%
                </span>
                <p className="text-white/30 text-xs mt-1">
                  {approved} approved · {flagged} flagged · {total} total
                </p>
              </div>
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <p className="text-white/30 text-xs">Most Active Repo</p>
                  <p className="text-sm font-medium">
                    {repoStats[0]?.repo ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-xs">Reviews This Month</p>
                  <p className="text-sm font-medium">
                    {
                      allReviews.filter((r) => {
                        const d = new Date(r.created_at);
                        const now = new Date();
                        return (
                          d.getMonth() === now.getMonth() &&
                          d.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly chart */}
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-base">Reviews Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ReviewsChart data={weeklyData} />
            ) : (
              <p className="text-white/40 text-sm text-center py-8">
                Not enough data yet. Open more PRs to see trends.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Repo breakdown */}
        <Card className="bg-zinc-900 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-base">By Repository</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {repoStats.length > 0 ? (
              repoStats.map((repo) => (
                <div
                  key={repo.repo}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{repo.repo}</span>
                    <span className="text-xs text-white/40">
                      {repo.total} review{repo.total !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-400">
                      {repo.total - repo.flagged} approved
                    </span>
                    {repo.flagged > 0 && (
                      <span className="text-red-400">
                        {repo.flagged} flagged
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-sm text-center py-4">
                No data yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
