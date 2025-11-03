/**
 * Request deduplication utility to prevent duplicate API calls
 * Useful for preventing double requests in StrictMode or HMR scenarios
 */

const pendingRequests = new Map<string, Promise<any>>()

/**
 * Execute a fetcher function only once per key at a time
 * If the same key is called again while the first call is pending,
 * it will return the same promise instead of making a new request
 */
export const dedupeRequest = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    console.log(`[DEDUPE] Request for ${key} already in progress, reusing promise`)
    return pendingRequests.get(key) as Promise<T>
  }

  console.log(`[DEDUPE] Starting new request for ${key}`)
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key)
    console.log(`[DEDUPE] Request for ${key} completed, cleaned up`)
  })

  pendingRequests.set(key, promise)
  return promise
}

/**
 * Clear all pending requests (useful for cleanup)
 */
export const clearPendingRequests = (): void => {
  pendingRequests.clear()
  console.log('[DEDUPE] All pending requests cleared')
}

/**
 * Check if a request is currently pending
 */
export const isRequestPending = (key: string): boolean => {
  return pendingRequests.has(key)
}