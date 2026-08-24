export type DiffOp = "equal" | "insert" | "delete"

export type DiffSegment = { op: DiffOp; text: string }

// Simple LCS-based char-level diff.
export function diffChars(expected: string, actual: string): DiffSegment[] {
  const a = [...expected]
  const b = [...actual]
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
      push(res, "equal", a[i])
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(res, "delete", a[i])
      i++
    } else {
      push(res, "insert", b[j])
      j++
    }
  }
  while (i < m) {
    push(res, "delete", a[i])
    i++
  }
  while (j < n) {
    push(res, "insert", b[j])
    j++
  }
  return res
}

function push(res: DiffSegment[], op: DiffOp, ch: string) {
  const last = res[res.length - 1]
  if (last && last.op === op) last.text += ch
  else res.push({ op, text: ch })
}
