export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream"
    >
      {/* drifting color blobs */}
      <div
        className="absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full bg-leaf/25 blur-3xl animate-blob"
        style={{ animationDuration: "26s" }}
      />
      <div
        className="absolute top-1/4 -right-48 h-[34rem] w-[34rem] rounded-full bg-sun/40 blur-3xl animate-blob"
        style={{ animationDuration: "30s", animationDelay: "-8s" }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[36rem] w-[36rem] rounded-full bg-tang/25 blur-3xl animate-blob"
        style={{ animationDuration: "34s", animationDelay: "-14s" }}
      />
      <div
        className="absolute right-1/4 bottom-1/3 h-[26rem] w-[26rem] rounded-full bg-berry/15 blur-3xl animate-blob"
        style={{ animationDuration: "24s", animationDelay: "-4s" }}
      />

      {/* faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(33,29,21,0.10) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* film grain */}
      <div className="grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />
    </div>
  );
}
