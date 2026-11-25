import { superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { ListUploadConfigError } from "@/lib/list-uploads/config";
import { errorMessage, readUpload, UploadNotReadableError } from "@/lib/list-uploads/read-upload";
import type { ReadEvent } from "@/lib/list-uploads/types";

/**
 * Read an upload's files with the List agent. Streams progress as one JSON
 * object per line (see ReadEvent). Closing the page stops the reading.
 */

// A 230-row list takes about 2 minutes; leave room for larger ones.
export const maxDuration = 300;

export async function POST(request: Request, ctx: RouteContext<"/api/superadmin/list-uploads/[id]/read">) {
  if (!(await superadminId())) return unauthorized();
  const { id } = await ctx.params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ReadEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        await readUpload(id, emit, request.signal);
      } catch (error) {
        if (!request.signal.aborted) {
          const known = error instanceof UploadNotReadableError || error instanceof ListUploadConfigError;
          if (!known) console.error("Reading list upload failed:", error);
          emit({ type: "error", message: known ? errorMessage(error) : "Reading the list failed. Try again." });
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
