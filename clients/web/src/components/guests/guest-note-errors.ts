import { ApiError } from "@shared";

export function getGuestNotesSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const dataMessage =
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof error.data.message === "string"
        ? error.data.message
        : "";

    const combined = `${error.message} ${dataMessage}`.toLowerCase();
    if (combined.includes("1000")) {
      return "Notes must be 1000 characters or fewer.";
    }
  }

  return "Failed to save notes. Please try again.";
}
