export const PROVIDER_MAPPING: Record<string, { slug: string; color: string }> = {
    openai: { slug: 'openai', color: '#000000' },
    gpt: { slug: 'openai', color: '#000000' },
    gemini: { slug: 'googlegemini', color: '#8E75FF' },
    google: { slug: 'googlegemini', color: '#8E75FF' },
    claude: { slug: 'anthropic', color: '#D97757' },
    anthropic: { slug: 'anthropic', color: '#D97757' },
    grok: { slug: 'x', color: '#000000' },
    xai: { slug: 'x', color: '#000000' },
    perplexity: { slug: 'perplexity', color: '#20B2AA' },
    meta: { slug: 'meta', color: '#0668E1' },
    llama: { slug: 'meta', color: '#0668E1' },
};

export function getProviderInfo(name: string) {
    if (!name) return null;
    const n = name.toLowerCase();
    for (const [key, value] of Object.entries(PROVIDER_MAPPING)) {
        if (n.includes(key)) return value;
    }
    return null;
}
