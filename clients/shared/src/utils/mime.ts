const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/jpg": "jpg",
  };
  
  /** Map a MIME type to an allowed image extension. Falls back to 'jpg'. */
  export function getExtFromMime(mimeType: string): string {
    return MIME_TO_EXT[mimeType] ?? "jpg";
  }