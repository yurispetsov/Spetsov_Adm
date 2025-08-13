import { describe, it, expect } from 'vitest'

describe('money format', () => {
  it('formats number', () => {
    const formatted = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(12345)
    expect(formatted.length).toBeGreaterThan(0)
  })
})
