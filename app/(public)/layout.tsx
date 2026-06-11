import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { MobileBanner } from "@/components/ui/MobileBanner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Public uniquement — ne doit jamais flotter au-dessus du dashboard admin */}
      <MobileBanner />
    </>
  );
}
