import { NextRequest } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import { saveClaimSession } from "@/lib/supabase";

export const maxDuration = 300; // Vercel Pro allows up to 300s for streaming routes

// Required for SSE streaming on Vercel — disables response buffering
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileBase64 = buffer.toString("base64");
  const mimeType = file.type || "application/pdf";
  const sessionId = crypto.randomUUID();

  const encoder = new TextEncoder();
  const fullResult: Record<string, unknown> = {};

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runPipeline(fileBase64, mimeType)) {
          if (event.data) Object.assign(fullResult, event.data);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...event, sessionId })}\n\n`));
        }
        await saveClaimSession(sessionId, fullResult);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step: 7, agent: "Complete", status: "done", message: "Analysis complete!", sessionId, data: fullResult })}\n\n`));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step: 0, agent: "Error", status: "error", message: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",        // disables Vercel/nginx buffering
      "X-Session-Id": sessionId,
      "Access-Control-Expose-Headers": "X-Session-Id",
    },
  });
}
