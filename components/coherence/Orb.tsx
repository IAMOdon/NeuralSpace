// The Coherence orb — the product's face. Pure CSS, no assets.
// States mirror the real app: idle (breathes), reading (pulse rings),
// speaking (bright glow). Reused across the hero and the scroll showcase.

type OrbState = "idle" | "reading" | "speaking";

export function Orb({
  size = 96,
  state = "idle",
  className = "",
}: {
  size?: number;
  state?: OrbState;
  className?: string;
}) {
  return (
    <span
      className={`coh-orb relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer ambient glow */}
      <span
        className="absolute inset-[-35%] rounded-full bg-ns-blue/30 blur-2xl motion-reduce:animate-none"
        style={{
          animation:
            state === "speaking"
              ? "orb-glow 1.6s ease-in-out infinite"
              : "orb-glow 4.5s ease-in-out infinite",
        }}
      />

      {/* Reading rings — the visible "I'm looking at the screen" signal */}
      {state === "reading" && (
        <>
          <span
            className="absolute inset-0 rounded-full border-2 border-ns-blue/50 motion-reduce:hidden"
            style={{ animation: "orb-ring 1.8s ease-out infinite" }}
          />
          <span
            className="absolute inset-0 rounded-full border-2 border-ns-blue/30 motion-reduce:hidden"
            style={{ animation: "orb-ring 1.8s ease-out 0.6s infinite" }}
          />
        </>
      )}

      {/* Core sphere */}
      <span
        className="relative rounded-full motion-reduce:animate-none"
        style={{
          width: size,
          height: size,
          animation: "orb-breathe 5s ease-in-out infinite",
          background:
            "radial-gradient(circle at 32% 28%, #8b96ff 0%, #4150ff 35%, #2233f0 60%, #101a8f 100%)",
          boxShadow:
            state === "speaking"
              ? "0 0 60px 8px rgba(34,51,240,0.55), inset 0 -8px 24px rgba(0,0,30,0.4)"
              : "0 0 40px 2px rgba(34,51,240,0.35), inset 0 -8px 24px rgba(0,0,30,0.4)",
        }}
      >
        {/* Specular highlight */}
        <span
          className="absolute rounded-full bg-white/70 blur-[6px]"
          style={{
            width: size * 0.22,
            height: size * 0.14,
            top: size * 0.16,
            left: size * 0.22,
            transform: "rotate(-20deg)",
          }}
        />
      </span>
    </span>
  );
}
