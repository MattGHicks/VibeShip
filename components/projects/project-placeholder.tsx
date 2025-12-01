import Image from "next/image";

export function ProjectPlaceholder() {
  return (
    <div className="relative aspect-video w-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />
      {/* Logo */}
      <div className="relative flex flex-col items-center gap-2">
        <Image
          src="/logo.svg"
          alt="VibeShip"
          width={64}
          height={64}
          className="opacity-40 group-hover:opacity-50 transition-opacity"
        />
        <span className="text-xs font-medium text-stone-500 tracking-wide">No preview yet</span>
      </div>
    </div>
  );
}
