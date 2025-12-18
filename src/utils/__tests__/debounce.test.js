import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delay function execution', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 300)

    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous calls if called again before delay', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 300)

    debouncedFunc()
    vi.advanceTimersByTime(200)
    debouncedFunc()
    vi.advanceTimersByTime(200)
    debouncedFunc()
    vi.advanceTimersByTime(300)

    expect(func).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments correctly', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 300)

    debouncedFunc('arg1', 'arg2')
    vi.advanceTimersByTime(300)

    expect(func).toHaveBeenCalledWith('arg1', 'arg2')
  })
})

