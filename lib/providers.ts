export const PROVIDER_MAPPING: Record<string, { slug: string; color: string }> = {
    openai: { slug: 'openai', color: '#000000' },
    gpt: { slug: 'openai', color: '#000000' },
    gemini: { slug: 'googlegemini', color: '#8E75FF' },
    google: { slug: 'googlegemini', color: '#8E75FF' },
    claude: { slug: 'anthropic', color: '#D97757' },
    anthropic: { slug: 'anthropic', color: '#D97757' },
    grok: { slug: 'x', color: '#000000' },
    xai: { slug: 'x', color: '#000000' },
    groq: { slug: 'groq', color: '#F55036' },
    qwen: { slug: 'qwen', color: '#525CB0' },
    mistral: { slug: 'mistralai', color: '#FDDA24' },
    perplexity: { slug: 'perplexity', color: '#20B2AA' },
    cohere: { slug: 'cohere', color: '#39594D' },
    meta: { slug: 'meta', color: '#0668E1' },
    llama: { slug: 'meta', color: '#0668E1' },
    deepseek: { slug: 'deepseek', color: '#4D6BFF' },
    stability: { slug: 'stabilityai', color: '#3232C2' },
    huggingface: { slug: 'huggingface', color: '#FFD21E' },
    hf: { slug: 'huggingface', color: '#FFD21E' },
};

export function getProviderInfo(name: string) {
    if (!name) return null;
    const n = name.toLowerCase();
    for (const [key, value] of Object.entries(PROVIDER_MAPPING)) {
        if (n.includes(key)) return value;
    }
    return null;
}
