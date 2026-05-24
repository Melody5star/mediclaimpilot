import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-flash-latest: confirmed working with this API key (2.0-flash and 1.5-flash both 404/quota-0)
export const gemini = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: { temperature: 0.1 },
});

export async function askGemini(prompt: string): Promise<string> {
  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("[Gemini] askGemini error:", err);
    throw err;
  }
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  try {
    const result = await gemini.generateContent(
      prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation."
    );
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as T;
  } catch (err) {
    console.error("[Gemini] askGeminiJSON error:", err);
    throw err;
  }
}

export async function askGeminiWithFile(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const result = await gemini.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      prompt,
    ]);
    return result.response.text();
  } catch (err) {
    console.error("[Gemini] askGeminiWithFile error:", err);
    throw err;
  }
}

export async function askGeminiWithFileJSON<T>(
  fileBase64: string,
  mimeType: string,
  prompt: string
): Promise<T> {
  try {
    const result = await gemini.generateContent([
      { inlineData: { data: fileBase64, mimeType } },
      prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
    ]);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(clean) as T;
  } catch (err) {
    console.error("[Gemini] askGeminiWithFileJSON error:", err);
    throw err;
  }
}
