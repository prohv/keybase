import { Lock, Users, Scan, ShieldCheck, RefreshCw, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description:
      "Each key is encrypted with a unique Initialization Vector before hitting our database. Keys are never stored or logged in plain text.",
  },
  {
    icon: Users,
    title: "Team Access Control",
    description:
      "Admins manage team creation and generate unique join codes. Users access shared vaults only after joining a valid team.",
  },
  {
    icon: Scan,
    title: "Provider Detection",
    description:
      "Automatic detection of API providers from key names — OpenAI, Anthropic, Google Cloud, AWS, Azure, and more.",
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
      "Secure management for API keys including creation, listing, secure reveal, and permanent deletion.",
  },
  {
    icon: BookOpen,
    title: "API Documentation",
    description:
      "Full Swagger/OpenAPI documentation at /api/docs. Type-safe validation with Zod end-to-end.",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-bg-section py-[var(--section-py)]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
        <div className="mb-12">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white rounded-3xl p-6 border border-border-light shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="w-10 h-10 bg-accent-tag rounded-xl flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-green-mid" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-forest mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-mid mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
