import { describe, it, expect } from 'vitest'
import { calculateStreak } from './calculateStreak'

describe('calculateStreak', () => {
  it('returns 0 for empty counts', () => {
    expect(calculateStreak({}, '2026-06-15')).toBe(0)
  })

  it('returns 0 when today and yesterday have no completions', () => {
    expect(calculateStreak({ '2026-06-13': 1 }, '2026-06-15')).toBe(0)
  })

  it('counts today and consecutive days back', () => {
    expect(
      calculateStreak(
        { '2026-06-13': 1, '2026-06-14': 2, '2026-06-15': 1 },
        '2026-06-15'
      )
    ).toBe(3)
  })

  it('stops at the first gap', () => {
    expect(
      calculateStreak(
        { '2026-06-14': 1, '2026-06-15': 1 },
        '2026-06-15'
      )
    ).toBe(2)
  })

  it('falls back to yesterday when today has 0 completions', () => {
    expect(
      calculateStreak(
        { '2026-06-13': 1, '2026-06-14': 1, '2026-06-15': 0 },
        '2026-06-15'
      )
    ).toBe(2)
  })

  it('falls back to yesterday when today is missing', () => {
    expect(
      calculateStreak(
        { '2026-06-13': 1, '2026-06-14': 1 },
        '2026-06-15'
      )
    ).toBe(2)
  })

  it('returns 0 when today is missing and yesterday is 0', () => {
    expect(
      calculateStreak(
        { '2026-06-13': 1, '2026-06-14': 0 },
        '2026-06-15'
      )
    ).toBe(0)
  })

  it('crosses month boundary', () => {
    expect(
      calculateStreak(
        { '2026-01-30': 1, '2026-01-31': 1, '2026-02-01': 1 },
        '2026-02-01'
      )
    ).toBe(3)
  })

  it('crosses year boundary', () => {
    expect(
      calculateStreak(
        { '2026-12-30': 1, '2026-12-31': 1, '2027-01-01': 1 },
        '2027-01-01'
      )
    ).toBe(3)
  })

  it('handles leap day boundary', () => {
    expect(
      calculateStreak(
        { '2024-02-28': 1, '2024-02-29': 1, '2024-03-01': 1 },
        '2024-03-01'
      )
    ).toBe(3)
  })

  it('treats any positive count as a counting day', () => {
    expect(
      calculateStreak(
        { '2026-06-13': 10, '2026-06-14': 1, '2026-06-15': 5 },
        '2026-06-15'
      )
    ).toBe(3)
  })
})
