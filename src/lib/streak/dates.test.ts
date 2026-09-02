import { describe, it, expect } from 'vitest'
import { toDateKey, addDays } from './dates'

describe('toDateKey', () => {
  it('returns local YYYY-MM-DD with zero-padded month and day', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateKey(new Date(2026, 11, 9))).toBe('2026-12-09')
  })

  it('uses local time, not UTC', () => {
    // 23:30 local on 2026-06-15 — already the next day in some UTC zones,
    // but the local calendar day is still 2026-06-15.
    const date = new Date(2026, 5, 15, 23, 30)
    expect(toDateKey(date)).toBe('2026-06-15')
  })
})

describe('addDays', () => {
  it('stays within the same month', () => {
    expect(addDays('2026-06-10', 3)).toBe('2026-06-13')
    expect(addDays('2026-06-10', -3)).toBe('2026-06-07')
  })

  it('crosses month boundaries forward', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
    expect(addDays('2026-03-30', 3)).toBe('2026-04-02')
  })

  it('crosses month boundaries backward', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-05-01', -1)).toBe('2026-04-30')
  })

  it('crosses year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('handles leap day in a leap year', () => {
    // 2024 is a leap year
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29')
  })

  it("2026 is not a leap year, so Feb 28 rolls to March 1", () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})
