/**
 * Axios cancela com `code === "ERR_CANCELED"`; `fetch`/`AbortController` usa `AbortError`.
 */
export function isRequestAborted(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "ERR_CANCELED") {
      return true;
    }
  }
  return false;
}
