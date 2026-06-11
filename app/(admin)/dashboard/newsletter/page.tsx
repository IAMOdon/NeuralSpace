import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Send } from "lucide-react";
import { listCampaigns } from "@/lib/actions/campaigns";
import { adminClient } from "@/lib/supabase/admin";
import { NewCampaignButton } from "@/components/admin/email/NewCampaignButton";

export const metadata: Metadata = { title: "Newsletter — Admin" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NewsletterPage() {
  const [campaigns, { count: subscriberCount }] = await Promise.all([
    listCampaigns(),
    adminClient
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .is("unsubscribed_at", null),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading font-black text-2xl text-ns-black">Newsletter</h1>
          <p className="text-sm text-neutral-400 font-sans mt-1">
            {campaigns.length} campagne{campaigns.length !== 1 ? "s" : ""} —{" "}
            {(subscriberCount ?? 0).toLocaleString("fr-FR")} abonné{(subscriberCount ?? 0) !== 1 ? "s" : ""} actif{(subscriberCount ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <NewCampaignButton />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Objet</th>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Statut</th>
              <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden md:table-cell">Destinataires</th>
              <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Mis à jour</th>
              <th className="px-5 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <p className="text-sm text-neutral-400 font-sans">
                    Aucune campagne — créez la première.
                  </p>
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 transition-colors duration-150 group">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/newsletter/${c.id}`} className="block">
                      <p className="font-sans font-medium text-ns-black line-clamp-1 max-w-md">
                        {c.subject || <span className="text-neutral-300">Sans objet</span>}
                      </p>
                      <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                        {c.blocks.length} bloc{c.blocks.length !== 1 ? "s" : ""}
                      </p>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.status === "sent" ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <Send className="w-3 h-3" /> Envoyée
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-neutral-100 text-neutral-500">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right hidden md:table-cell">
                    <span className="font-heading font-bold text-sm text-ns-black">
                      {c.recipientCount != null ? c.recipientCount.toLocaleString("fr-FR") : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                    <span className="text-xs text-neutral-400 font-sans">
                      {formatDate(c.sentAt ?? c.updatedAt)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                      <Link
                        href={`/dashboard/newsletter/${c.id}`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-ns-blue hover:bg-ns-blue/5 transition-colors duration-150"
                        aria-label={c.status === "sent" ? "Voir" : "Éditer"}
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
