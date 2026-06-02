import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const gemini = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: { temperature: 0 },
});

// Retries up to 4 times on 503 overload with exponential backoff
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [2000, 4000, 8000]; // ms between retries — kept short for Vercel 60s timeout
  let lastError: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isOverload = msg.includes("503") || msg.includes("429") || msg.includes("overloaded") || msg.includes("high demand") || msg.includes("Service Unavailable") || msg.includes("Too Many Requests") || msg.includes("quota");
      if (isOverload && attempt < delays.length) {
        lastError = err;
        await new Promise((res) => setTimeout(res, delays[attempt]));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function askGemini(prompt: string): Promise<string> {
  return withRetry(async () => {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  });
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  return withRetry(async () => {
    const result = await gemini.generateContent(
      prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation."
    );
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as T;
  });
}

export async function askGeminiWithFile(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  return withRetry(async () => {
    const result = await gemini.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      prompt,
    ]);
    return result.response.text();
  });
}

export async function askGeminiWithFileJSON<T>(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<T> {
  return withRetry(async () => {
    const result = await gemini.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
    ]);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as T;
  });
}
