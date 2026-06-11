"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink, Pencil, Loader2 } from "lucide-react";
import { setReportStatus, type ArticleReport } from "@/lib/actions/reports";

const STATUS_BADGE: Record<ArticleReport["status"], { label: string; cls: string }> = {
  new: { label: "Nouveau", cls: "bg-ns-blue/10 text-ns-blue" },
  accepted: { label: "Accepté", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejeté", cls: "bg-neutral-100 text-neutral-400" },
};

export function ReportRow({ report }: { report: ArticleReport }) {
  const router = useRouter();
  const [pending, setPending] = useState<"accepted" | "rejected" | null>(null);

  async function resolve(status: "accepted" | "rejected") {
    if (pending) return;
    setPending(status);
    const result = await setReportStatus(report.id, status);
    setPending(null);
    if (result.ok) router.refresh();
  }

  const badge = STATUS_BADGE[report.status];
  const date = new Date(report.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3.5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-sans font-semibold text-sm text-ns-black line-clamp-1">
            {report.articleTitle}
          </p>
          <p className="text-[11px] text-neutral-400 font-sans mt-0.5">{date}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Quote */}
      {report.quote && (
        <blockquote className="border-l-2 border-neutral-200 pl-3 text-xs font-sans text-neutral-500 italic leading-5">
          « {report.quote} »
        </blockquote>
      )}

      {/* Message */}
      <p className="text-sm font-sans text-neutral-700 leading-6">{report.message}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 flex-wrap text-xs font-sans">
        {report.sourceUrl && (
          <a
            href={report.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-ns-blue hover:opacity-70 transition-opacity"
          >
            <ExternalLink className="w-3 h-3" />
            Source proposée
          </a>
        )}
        {report.reporterEmail && (
          <span className="text-neutral-400">{report.reporterEmail}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-50 flex-wrap">
        <Link
          href={`/dashboard/articles/${report.articleId}/edit`}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-neutral-500 hover:text-ns-blue transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
          Éditer l&apos;article
        </Link>
        {report.status === "new" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => resolve("rejected")}
              disabled={!!pending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-sans font-semibold text-neutral-500 hover:border-neutral-300 hover:text-ns-black transition-colors disabled:opacity-50"
            >
              {pending === "rejected" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Rejeter
            </button>
            <button
              onClick={() => resolve("accepted")}
              disabled={!!pending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ns-blue text-white text-xs font-sans font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {pending === "accepted" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Accepter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
