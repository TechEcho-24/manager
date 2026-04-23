export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/10 opacity-20 blur-[100px] dark:bg-[oklch(0.35_0.15_260)]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-primary/10 opacity-15 blur-[100px] dark:bg-[oklch(0.30_0.18_300)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.25_0.12_240)] opacity-10 blur-[80px]" />

      {children}
    </div>
  );
}
