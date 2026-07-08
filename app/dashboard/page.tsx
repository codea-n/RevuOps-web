import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { registerInstallation, signOut } from "@/lib/actions";
import Link from "next/link";
import type { Review } from "@/app/dashboard/types";
import RepoList from "./components/RepoList";
import UsageBar from "./components/UsageBar";
import ThemeToggle from "@/app/components/ThemeToggle";
import Image from "next/image";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ installation_id?: string; setup_action?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const githubUsername = user.user_metadata?.user_name || "";
  const avatarUrl = user.user_metadata?.avatar_url || "";

  const params = await searchParams;
  if (params.installation_id) {
    try {
      await registerInstallation(params.installation_id, githubUsername);
    } catch (e) {
      console.error("Failed to register installation:", e);
    }
    redirect("/dashboard");
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const stats = {
    total: reviews?.length ?? 0,
    approved:
      reviews?.filter((r: Review) => r.review_text?.includes("APPROVE"))
        .length ?? 0,
    flagged:
      reviews?.filter((r: Review) => !r.review_text?.includes("APPROVE"))
        .length ?? 0,
  };

  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const installUrl = `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-semibold text-foreground tracking-tight"
            >
              RevuOps
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground border-b-2 border-primary pb-0.5"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/analytics"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/status"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Status
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href={installUrl}>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                + Connect repo
              </Button>
            </a>
            <form action={signOut}>
              <Button
                size="sm"
                variant="ghost"
                type="submit"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign out
              </Button>
            </form>
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={githubUsername}
                width={32}
                height={32}
                className="rounded-full border border-border"
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {githubUsername ? `@${githubUsername}` : user.email}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total reviews", value: stats.total },
            { label: "Approved", value: stats.approved },
            { label: "Flagged", value: stats.flagged },
            { label: "Approval rate", value: `${approvalRate}%` },
          ].map(({ label, value }) => (
            <Card key={label} className="border-border shadow-none">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageBar userId={user.id} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Connected repos — 1 col */}
          <Card className="border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Repositories
                </CardTitle>
                <a
                  href={installUrl}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  + Add
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <RepoList
                userId={user.id}
                installUrl={installUrl}
                apiUrl={process.env.NEXT_PUBLIC_API_URL!}
              />
            </CardContent>
          </Card>

          {/* Recent reviews — 2 cols */}
          <Card className="md:col-span-2 border-border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: Review) => (
                  <Link
                    key={review.id}
                    href={`/dashboard/reviews/${review.id}`}
                    className="flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {review.repo}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PR #{review.pr_number} ·{" "}
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        review.review_text?.includes("APPROVE")
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                      }
                    >
                      {review.review_text?.includes("APPROVE")
                        ? "Approved"
                        : "Flagged"}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <p className="text-sm font-medium text-foreground">
                    No reviews yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect a repository and open a pull request to get started.
                  </p>
                  <a href={installUrl} className="mt-4">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                    >
                      Connect a repository
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
