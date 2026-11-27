import { errorFrom } from "./read-stream";

/** Fetches a file of an upload (for FilePreview). */
export function uploadedFile(uploadId: string, fileId: string): () => Promise<Blob> {
  return async () => {
    const link = await fetch(`/api/superadmin/list-uploads/${uploadId}/files/${fileId}`);
    if (!link.ok) throw new Error(await errorFrom(link));
    const { url } = (await link.json()) as { url: string };
    const file = await fetch(url);
    if (!file.ok) throw new Error("The file could not be downloaded.");
    return file.blob();
  };
}
