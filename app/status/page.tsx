import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function checkBackend(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkSupabase(): Promise<{ ok: boolean }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reviews").select("id").limit(1);
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

async function getLastReview(): Promise<{ created_at: string } | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data;
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default async function StatusPage() {
  const [backend, supabase, lastReview] = await Promise.all([
    checkBackend(),
    checkSupabase(),
    getLastReview(),
  ]);

  const allOk = backend.ok && supabase.ok;

  const services = [
    {
      name: "Review API",
      description: "FastAPI backend on Render",
      ok: backend.ok,
      detail: backend.ok ? `${backend.latencyMs}ms` : "Unreachable",
    },
    {
      name: "Database",
      description: "Supabase PostgreSQL",
      ok: supabase.ok,
      detail: supabase.ok ? "Connected" : "Unreachable",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">
          RevuOps
        </Link>
        <Link href="/login">
          <span className="text-white/50 text-sm hover:text-white transition-colors">
            Dashboard →
          </span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16 flex flex-col gap-8">
        {/* Overall status */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${allOk ? "bg-green-400" : "bg-red-400"} animate-pulse`}
            />
            <h1 className="text-2xl font-bold">
              {allOk ? "All Systems Operational" : "Service Disruption"}
            </h1>
          </div>
          {lastReview && (
            <p className="text-white/40 text-sm">
              Last review posted {timeAgo(lastReview.created_at)}
            </p>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <Card
              key={service.name}
              className="bg-zinc-900 border-white/10 text-white"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-medium">
                      {service.name}
                    </CardTitle>
                    <p className="text-white/40 text-xs">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs">
                      {service.detail}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        service.ok
                          ? "border-green-500/40 text-green-400"
                          : "border-red-500/40 text-red-400"
                      }
                    >
                      {service.ok ? "Operational" : "Down"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Info */}
        <p className="text-white/20 text-xs text-center">
          Updates every page load • RevuOps
        </p>
      </div>
    </main>
  );
}
