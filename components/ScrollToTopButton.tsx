"use client";

export function ScrollToTopButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center justify-center bg-primary text-primary-foreground px-10 h-14 font-bold text-lg hover:bg-primary/90 transition-colors"
    >
      Start Your Analysis
    </button>
  );
}
