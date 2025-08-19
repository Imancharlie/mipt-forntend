// Lightweight wrapper around FingerprintJS to generate a stable browser/device ID
// Note: Requires dependency: @fingerprintjs/fingerprintjs

let fpAgentPromise: Promise<any> | null = null;

async function loadAgent(): Promise<any | null> {
  try {
    if (!fpAgentPromise) {
      // Dynamic import to avoid SSR/build issues if module missing before install
      fpAgentPromise = import('@fingerprintjs/fingerprintjs')
        .then((mod) => mod.load())
        .catch(() => null);
    }
    return await fpAgentPromise;
  } catch {
    return null;
  }
}

export type FingerprintData = {
  visitorId: string;
  confidence?: number;
};

export async function getFingerprint(): Promise<FingerprintData | null> {
  try {
    const agent = await loadAgent();
    if (!agent) return null;
    const result = await agent.get();
    return {
      visitorId: result.visitorId,
      confidence: result.confidence?.score,
    };
  } catch {
    return null;
  }
}


