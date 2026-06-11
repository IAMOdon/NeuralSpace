import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCampaign, getEmailConfigStatus } from "@/lib/actions/campaigns";
import { EmailBuilder } from "@/components/admin/email/EmailBuilder";

export const metadata: Metadata = { title: "Campagne — Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function CampaignPage({ params }: Props) {
  const { id } = await params;
  const [campaign, config] = await Promise.all([getCampaign(id), getEmailConfigStatus()]);
  if (!campaign) notFound();

  return <EmailBuilder initial={campaign} emailConfigured={config.configured} />;
}
