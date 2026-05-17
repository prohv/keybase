import { Lock, Users, Scan, ShieldCheck, RefreshCw, Key } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description:
      "Each key is encrypted with a unique Initialization Vector before hitting our database. Keys are never stored or logged in plain text.",
  },
  {
    icon: Users,
    title: "Team & Project Access",
    description:
      "Organize keys into projects within teams. Each project has its own isolated vault. Only team members can access its keys.",
  },
  {
    icon: Scan,
    title: "Provider Detection",
    description:
      "Automatic detection of API providers from key names: OpenAI, Anthropic, Google Cloud, AWS, Azure, and more.",
  },
  {
    icon: ShieldCheck,
    title: "Audit Logging",
    description:
      "Keep track of who created, revealed, and deleted keys. Complete visibility into your team's security posture.",
  },
  {
    icon: RefreshCw,
    title: "Full CRUD Lifecycle",
    description:
      "Secure management for API keys including creation, listing, secure reveal, and permanent deletion per project.",
  },
  {
    icon: Key,
    title: "Access Tokens",
    description:
      "Generate scoped, time-bound API tokens for programmatic access. Uses Bearer auth, perfect for CLI tools and CI/CD pipelines.",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-bg-section py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
        <div className="mb-14">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border-light text-xs font-medium text-muted-foreground tracking-wide">
            OUR FEATURES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest mt-4 leading-[1.15] max-w-2xl">
            Everything your team needs to{' '}
            <span className="relative inline-block">
              manage API keys
              <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-green-pale/60 -z-10" />
            </span>{' '}
            securely.
          </h2>
        </div>

        <div className="relative max-w-3xl">
          <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-green-pale to-green-dark rounded-full" />

          <div className="space-y-0">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="relative pl-14 pb-8 last:pb-0 group">
                  <div className="absolute left-[14px] top-[0.625rem] w-[12px] h-[12px] rounded-full bg-green-dark ring-4 ring-bg-section transition-transform duration-300 group-hover:scale-125" />

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent-tag rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-green-mid" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-base text-forest mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium max-w-xl">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
