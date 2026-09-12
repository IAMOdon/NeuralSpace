import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";

// Export CSV complet d'une liste (admin uniquement).

function csvField(v: string | null): string {
  if (v === null) return "";
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const list = req.nextUrl.searchParams.get("list") === "waitlist" ? "waitlist" : "newsletter";

  const rows: string[] = [];
  if (list === "newsletter") {
    const { data } = await getAdminClient()
      .from("newsletter_subscribers")
      .select("email, source, country, created_at, unsubscribed_at")
      .order("created_at", { ascending: false });
    rows.push("email,source,country,created_at,unsubscribed_at");
    for (const r of data ?? []) {
      rows.push([r.email, r.source, r.country, r.created_at, r.unsubscribed_at].map(csvField).join(","));
    }
  } else {
    const { data } = await getAdminClient()
      .from("coherence_waitlist")
      .select("email, source, country, created_at")
      .order("created_at", { ascending: false });
    rows.push("email,source,country,created_at");
    for (const r of data ?? []) {
      rows.push([r.email, r.source, r.country, r.created_at].map(csvField).join(","));
    }
  }

  const filename = `${list}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
