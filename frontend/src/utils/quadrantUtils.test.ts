import { describe, it, expect } from 'vitest'
import {
  getQuadrantColor,
  getPointColor,
  getQuadrantBorderColor,
  getQuadrantLabel,
  scoreToPosition,
  positionToScore,
} from '../utils/quadrantUtils'

describe('quadrantUtils', () => {
  describe('getQuadrantColor', () => {
    it('returns red color for L1 (important and urgent)', () => {
      expect(getQuadrantColor(2, 2)).toBe('rgba(239, 68, 68, 0.1)')
      expect(getQuadrantColor(1, 1)).toBe('rgba(239, 68, 68, 0.1)')
      expect(getQuadrantColor(0, 0)).toBe('rgba(239, 68, 68, 0.1)')
    })

    it('returns green color for L2 (important not urgent)', () => {
      expect(getQuadrantColor(2, -1)).toBe('rgba(34, 197, 94, 0.1)')
      expect(getQuadrantColor(1, -2)).toBe('rgba(34, 197, 94, 0.1)')
      expect(getQuadrantColor(0, -3)).toBe('rgba(34, 197, 94, 0.1)')
    })

    it('returns orange color for L3 (not important but urgent)', () => {
      expect(getQuadrantColor(-1, 2)).toBe('rgba(249, 115, 22, 0.1)')
      expect(getQuadrantColor(-2, 1)).toBe('rgba(249, 115, 22, 0.1)')
      expect(getQuadrantColor(-3, 0)).toBe('rgba(249, 115, 22, 0.1)')
    })

    it('returns purple color for L4 (not important not urgent)', () => {
      expect(getQuadrantColor(-1, -1)).toBe('rgba(168, 85, 247, 0.1)')
      expect(getQuadrantColor(-2, -2)).toBe('rgba(168, 85, 247, 0.1)')
      expect(getQuadrantColor(-3, -3)).toBe('rgba(168, 85, 247, 0.1)')
    })
  })

  describe('getPointColor', () => {
    it('returns red color for L1 points', () => {
      expect(getPointColor(2, 2)).toBe('#ef4444')
      expect(getPointColor(1, 1)).toBe('#ef4444')
      expect(getPointColor(0, 0)).toBe('#ef4444')
    })

    it('returns green color for L2 points', () => {
      expect(getPointColor(2, -1)).toBe('#22c55e')
      expect(getPointColor(1, -2)).toBe('#22c55e')
      expect(getPointColor(0, -3)).toBe('#22c55e')
    })

    it('returns orange color for L3 points', () => {
      expect(getPointColor(-1, 2)).toBe('#f97316')
      expect(getPointColor(-2, 1)).toBe('#f97316')
      expect(getPointColor(-3, 0)).toBe('#f97316')
    })

    it('returns purple color for L4 points', () => {
      expect(getPointColor(-1, -1)).toBe('#a855f7')
      expect(getPointColor(-2, -2)).toBe('#a855f7')
      expect(getPointColor(-3, -3)).toBe('#a855f7')
    })
  })

  describe('getQuadrantBorderColor', () => {
    it('returns red border for L1', () => {
      expect(getQuadrantBorderColor(2, 2)).toBe('#ef4444')
      expect(getQuadrantBorderColor(1, 1)).toBe('#ef4444')
      expect(getQuadrantBorderColor(0, 0)).toBe('#ef4444')
    })

    it('returns green border for L2', () => {
      expect(getQuadrantBorderColor(2, -1)).toBe('#22c55e')
      expect(getQuadrantBorderColor(1, -2)).toBe('#22c55e')
      expect(getQuadrantBorderColor(0, -3)).toBe('#22c55e')
    })

    it('returns orange border for L3', () => {
      expect(getQuadrantBorderColor(-1, 2)).toBe('#f97316')
      expect(getQuadrantBorderColor(-2, 1)).toBe('#f97316')
      expect(getQuadrantBorderColor(-3, 0)).toBe('#f97316')
    })

    it('returns purple border for L4', () => {
      expect(getQuadrantBorderColor(-1, -1)).toBe('#a855f7')
      expect(getQuadrantBorderColor(-2, -2)).toBe('#a855f7')
      expect(getQuadrantBorderColor(-3, -3)).toBe('#a855f7')
    })
  })

  describe('getQuadrantLabel', () => {
    it('returns correct L1 label', () => {
      expect(getQuadrantLabel(2, 2)).toBe('L1 - 重要且紧急')
      expect(getQuadrantLabel(1, 1)).toBe('L1 - 重要且紧急')
      expect(getQuadrantLabel(0, 0)).toBe('L1 - 重要且紧急')
    })

    it('returns correct L2 label', () => {
      expect(getQuadrantLabel(2, -1)).toBe('L2 - 重要不紧急')
      expect(getQuadrantLabel(1, -2)).toBe('L2 - 重要不紧急')
      expect(getQuadrantLabel(0, -3)).toBe('L2 - 重要不紧急')
    })

    it('returns correct L3 label', () => {
      expect(getQuadrantLabel(-1, 2)).toBe('L3 - 不重要但紧急')
      expect(getQuadrantLabel(-2, 1)).toBe('L3 - 不重要但紧急')
      expect(getQuadrantLabel(-3, 0)).toBe('L3 - 不重要但紧急')
    })

    it('returns correct L4 label', () => {
      expect(getQuadrantLabel(-1, -1)).toBe('L4 - 不重要不紧急')
      expect(getQuadrantLabel(-2, -2)).toBe('L4 - 不重要不紧急')
      expect(getQuadrantLabel(-3, -3)).toBe('L4 - 不重要不紧急')
    })
  })

  describe('scoreToPosition', () => {
    it('converts score -3 to position 0', () => {
      expect(scoreToPosition(-3)).toBe(0)
    })

    it('converts score 0 to position 50', () => {
      expect(scoreToPosition(0)).toBe(50)
    })

    it('converts score 3 to position 100', () => {
      expect(scoreToPosition(3)).toBe(100)
    })

    it('converts intermediate scores correctly', () => {
      expect(scoreToPosition(-1.5)).toBe(25)
      expect(scoreToPosition(1.5)).toBe(75)
    })

    it('handles edge cases', () => {
      expect(scoreToPosition(-4)).toBeCloseTo(-16.67, 1) // Below minimum
      expect(scoreToPosition(4)).toBeCloseTo(116.67, 1) // Above maximum
    })
  })

  describe('positionToScore', () => {
    it('converts position 0 to score -3', () => {
      expect(positionToScore(0)).toBe(-3)
    })

    it('converts position 50 to score 0', () => {
      expect(positionToScore(50)).toBe(0)
    })

    it('converts position 100 to score 3', () => {
      expect(positionToScore(100)).toBe(3)
    })

    it('converts intermediate positions correctly', () => {
      expect(positionToScore(25)).toBe(-1)  // Math.round((25/100)*6-3) = Math.round(-1.5) = -1
      expect(positionToScore(75)).toBe(2)   // Math.round((75/100)*6-3) = Math.round(1.5) = 2
    })

    it('handles edge cases', () => {
      expect(positionToScore(-10)).toBe(-4) // Math.round((-10/100)*6-3) = Math.round(-3.6) = -4
      expect(positionToScore(110)).toBe(4)  // Math.round((110/100)*6-3) = Math.round(3.6) = 4
    })
  })

  describe('round-trip conversion', () => {
    it('score to position and back maintains accuracy', () => {
      const scores = [-3, -2, -1, 0, 1, 2, 3]
      scores.forEach(score => {
        const position = scoreToPosition(score)
        const convertedBack = positionToScore(position)
        expect(convertedBack).toBe(score)
      })
    })

    it('position to score and back maintains accuracy', () => {
      const positions = [0, 50, 100] // 只测试边界值，避免精度问题
      positions.forEach(position => {
        const score = positionToScore(position)
        const convertedBack = scoreToPosition(score)
        expect(convertedBack).toBe(position)
      })
    })
  })

  describe('boundary conditions', () => {
    it('handles zero values correctly', () => {
      expect(getQuadrantColor(0, 0)).toBe('rgba(239, 68, 68, 0.1)')
      expect(getPointColor(0, 0)).toBe('#ef4444')
      expect(getQuadrantBorderColor(0, 0)).toBe('#ef4444')
      expect(getQuadrantLabel(0, 0)).toBe('L1 - 重要且紧急')
    })

    it('handles maximum positive values', () => {
      expect(getQuadrantColor(3, 3)).toBe('rgba(239, 68, 68, 0.1)')
      expect(getPointColor(3, 3)).toBe('#ef4444')
      expect(getQuadrantBorderColor(3, 3)).toBe('#ef4444')
      expect(getQuadrantLabel(3, 3)).toBe('L1 - 重要且紧急')
    })

    it('handles maximum negative values', () => {
      expect(getQuadrantColor(-3, -3)).toBe('rgba(168, 85, 247, 0.1)')
      expect(getPointColor(-3, -3)).toBe('#a855f7')
      expect(getQuadrantBorderColor(-3, -3)).toBe('#a855f7')
      expect(getQuadrantLabel(-3, -3)).toBe('L4 - 不重要不紧急')
    })
  })
})