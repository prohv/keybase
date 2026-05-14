const tickerItems = [
  "AES-256 Encryption",
  "Zero-Knowledge Architecture",
  "Team Vaults",
  "JWT Authentication",
  "bcrypt Hashing",
  "Secure Sharing",
];

export function Ticker() {
  const content = tickerItems.join(" ● ") + " ● ";

  return (
    <div className="w-full bg-bg-green-light overflow-hidden py-2.5" aria-hidden="true">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-xs font-medium text-green-dark uppercase tracking-wider px-4">
          {content}
        </span>
        <span className="text-xs font-medium text-green-dark uppercase tracking-wider px-4">
          {content}
        </span>
      </div>
    </div>
  );
}
