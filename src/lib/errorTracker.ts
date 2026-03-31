/**
 * Per-operation failure counter.
 * After 2 consecutive failures, returns a unified "refresh" message.
 * Resets on success or page reload (module-level state).
 */

const failCounts = new Map<string, number>()

const UNIFIED_FAIL_MSG = '还是失败了，可能是网络问题。请刷新页面后重试。'

export function trackFailure(operation: string, firstFailMsg: string): string {
  const count = (failCounts.get(operation) || 0) + 1
  failCounts.set(operation, count)
  return count >= 2 ? UNIFIED_FAIL_MSG : firstFailMsg
}

export function trackSuccess(operation: string): void {
  failCounts.delete(operation)
}
