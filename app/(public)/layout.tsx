export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Nav placeholder */}
      <main className="flex-1">{children}</main>
      {/* Footer placeholder */}
    </>
  );
}
