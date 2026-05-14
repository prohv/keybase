import { ChevronDown } from "lucide-react";

const steps = [
  {
    label: "Create a Team",
    description:
      "Admins create a team, and a unique 8-character hex join code is generated automatically. You're in control of who gets access.",
  },
  {
    label: "Invite Members",
    description:
      "Share the join code with your teammates. Users gain access to shared vaults only after joining via a valid code.",
  },
  {
    label: "Store Keys Securely",
    description:
      "API keys are encrypted with AES-256-CBC before database entry. Keys are never stored or logged in plain text.",
  },
  {
    label: "Reveal On Demand",
    description:
      "Authorized users can decrypt and reveal keys one at a time. Keys are never persisted in browser state or query cache.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-[var(--section-py)]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-border-light text-xs font-medium text-muted-foreground tracking-wide">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest mt-4 leading-[1.15]">
              Get started in{' '}
              <span className="relative inline-block">
                four steps
                <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-green-pale/60 -z-10" />
              </span>
              .
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed self-end max-w-md font-medium">
            From team creation to secure key access, KeyBase makes it simple
            to manage your team&apos;s API credentials.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <details
              key={step.label}
              className="group border border-border-light rounded-2xl open:bg-bg-muted transition-colors"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-dark text-white text-xs font-heading font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-heading font-semibold text-sm sm:text-base text-forest">
                    {step.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-green-mid transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 pl-16">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
