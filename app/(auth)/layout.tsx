export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050510] p-4 lg:p-0">
      {/* Enhanced Aurora Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0,transparent_60%)] blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0,transparent_60%)] blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] right-[5%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_60%)] blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0,transparent_60%)] blur-[120px]" />
        
        {/* Subtle noise and grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
