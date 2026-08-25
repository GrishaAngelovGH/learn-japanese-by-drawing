export type DiffOp = "equal" | "insert" | "delete"

export type DiffSegment = { op: DiffOp; text: string }

/**
 * LCS-based diff over any token sequence. `key` decides when two tokens are equal and
 * `show` decides how a token is printed, so callers can diff sounds but display letters.
 */
export function diffTokens<T>(
  expected: T[],
  actual: T[],
  key: (t: T) => string,
  show: (t: T) => string
): DiffSegment[] {
  const a = expected.map(key)
  const b = actual.map(key)
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = 1 + dp[i + 1][j + 1]
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const res: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      push(res, "equal", show(expected[i]))
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(res, "delete", show(expected[i]))
      i++
    } else {
      push(res, "insert", show(actual[j]))
      j++
    }
  }
  while (i < m) {
    push(res, "delete", show(expected[i]))
    i++
  }
  while (j < n) {
    push(res, "insert", show(actual[j]))
    j++
  }
  return res
}

// Character-level diff between two strings.
export function diffChars(expected: string, actual: string): DiffSegment[] {
  return diffTokens([...expected], [...actual], (c) => c, (c) => c)
}

function push(res: DiffSegment[], op: DiffOp, text: string) {
  const last = res[res.length - 1]
  if (last && last.op === op) last.text += text
  else res.push({ op, text })
}
