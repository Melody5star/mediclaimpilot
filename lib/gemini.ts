import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const gemini = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { temperature: 0.1 },
});

export async function askGemini(prompt: string): Promise<string> {
  const result = await gemini.generateContent(prompt);
  return result.response.text();
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  const result = await gemini.generateContent(
    prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation."
  );
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(clean) as T;
}

export async function askGeminiWithFile(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const result = await gemini.generateContent([
    { inlineData: { data: fileBase64, mimeType } },
    prompt,
  ]);
  return result.response.text();
}

export async function askGeminiWithFileJSON<T>(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<T> {
  const result = await gemini.generateContent([
    { inlineData: { data: fileBase64, mimeType } },
    prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
  ]);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(clean) as T;
}
