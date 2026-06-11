import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { listReports, type ReportStatus } from "@/lib/actions/reports";
import { ReportRow } from "@/components/admin/ReportRow";

export const metadata: Metadata = { title: "Signalements — Admin" };

const FILTERS: { key: ReportStatus | "all"; label: string }[] = [
  { key: "new", label: "Nouveaux" },
  { key: "accepted", label: "Acceptés" },
  { key: "rejected", label: "Rejetés" },
  { key: "all", label: "Tous" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function ReportsPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const filter = (FILTERS.find((f) => f.key === statusParam)?.key ?? "new") as ReportStatus | "all";
  const reports = await listReports(filter === "all" ? undefined : filter);

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">

      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl text-ns-black">Signalements</h1>
        <p className="text-sm text-neutral-400 font-sans mt-1">
          Erreurs signalées par les lecteurs — accepter un signalement implique de corriger
          l&apos;article puis d&apos;y publier une note de correction datée.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`?status=${f.key}`}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold transition-colors duration-200 ${
              filter === f.key
                ? "bg-ns-blue text-white"
                : "bg-white border border-neutral-200 text-neutral-500 hover:border-ns-blue hover:text-ns-blue"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-neutral-100 bg-white px-6 py-16 text-center space-y-2">
          <Flag className="w-6 h-6 text-neutral-200 mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-neutral-400 font-sans">
            Aucun signalement {filter === "new" ? "en attente" : ""} — c&apos;est bon signe.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
