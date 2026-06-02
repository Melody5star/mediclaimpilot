import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model priority list — tries each in order if previous is overloaded
const MODEL_PRIORITY = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
];

function getModel(modelName: string) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0 },
  });
}

// Retries across model list on 503 overload errors
async function withRetry<T>(fn: (model: ReturnType<typeof getModel>) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = getModel(modelName);
      return await fn(model);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is503 = msg.includes("503") || msg.includes("overloaded") || msg.includes("high demand") || msg.includes("Service Unavailable");
      const is404 = msg.includes("404") || msg.includes("not found");
      if (is503 || is404) {
        lastError = err;
        continue; // try next model
      }
      throw err; // non-503 errors bubble up immediately
    }
  }
  throw lastError;
}

export async function askGemini(prompt: string): Promise<string> {
  return withRetry(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  return withRetry(async (model) => {
    const result = await model.generateContent(
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
  return withRetry(async (model) => {
    const result = await model.generateContent([
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
  return withRetry(async (model) => {
    const result = await model.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
    ]);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as T;
  });
}
