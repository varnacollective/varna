import type { ReadEvent } from "@/lib/list-uploads/types";

/** Calls onEvent for each line of a streamed JSON-lines response. */
export async function readEvents(response: Response, onEvent: (event: ReadEvent) => void): Promise<void> {
  if (!response.body) return;
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffered = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered += value;
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) onEvent(JSON.parse(line) as ReadEvent);
  }
  if (buffered.trim()) onEvent(JSON.parse(buffered) as ReadEvent);
}

/** The error message from a failed JSON response. */
export async function errorFrom(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? `Something went wrong (${response.status}).`;
}
