import { describe, expect, it, vi } from 'vitest';
import { effect } from './effect.ts';
import { signal } from './signal.ts';

describe('effect()', () => {
  it('runs immediately on creation', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      count();
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('re-runs when a dependency changes', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      count();
      spy();
    });

    count.set(1);
    expect(spy).toHaveBeenCalledTimes(2);

    count.set(2);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('tracks multiple dependencies', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();

    effect(() => {
      a();
      b();
      spy();
    });

    a.set(1);
    expect(spy).toHaveBeenCalledTimes(2);

    b.set(1);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('does not re-run for peek() reads', () => {
    const count = signal(0);
    const other = signal(0);
    const spy = vi.fn();

    effect(() => {
      other();
      count.peek();
      spy();
    });

    count.set(99);
    expect(spy).toHaveBeenCalledTimes(1);

    other.set(1);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('cleanup stops re-runs', () => {
    const count = signal(0);
    const spy = vi.fn();

    const stop = effect(() => {
      count();
      spy();
    });

    stop();
    count.set(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('handles conditional dependencies correctly', () => {
    const flag = signal(true);
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn();

    effect(() => {
      if (flag()) {
        a();
      } else {
        b();
      }
      spy();
    });

    a.set('a2');
    expect(spy).toHaveBeenCalledTimes(2);

    b.set('b2');
    expect(spy).toHaveBeenCalledTimes(2);

    flag.set(false);
    expect(spy).toHaveBeenCalledTimes(3);

    b.set('b3');
    expect(spy).toHaveBeenCalledTimes(4);

    a.set('a3');
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it('does not run after stop() is called', () => {
    const count = signal(0);
    const spy = vi.fn();

    const stop = effect(() => {
      count();
      spy();
    });

    stop();
    stop();

    count.set(1);
    count.set(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('detects and throws on infinite loops', () => {
    const count = signal(0);
    expect(() => {
      effect(() => {
        count();
        count.set(count.peek() + 1);
      });
    }).toThrow('[astro-dx] Infinite loop detected in effect');
  });

  it('handles errors with onError callback', () => {
    const count = signal(0);
    const onError = vi.fn();

    effect(
      () => {
        if (count() > 0) {
          throw new Error('Test error');
        }
      },
      { onError }
    );

    expect(onError).not.toHaveBeenCalled();

    count.set(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toContain('Test error');
  });

  it('logs errors to console when no onError provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const count = signal(0);

    effect(() => {
      if (count() > 0) {
        throw new Error('Console error test');
      }
    });

    count.set(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Console error test'));

    consoleSpy.mockRestore();
  });

  it('supports named effects', () => {
    const count = signal(0);
    const onError = vi.fn();

    effect(
      () => {
        if (count() > 0) {
          throw new Error('Named effect error');
        }
      },
      { name: 'MyEffect', onError }
    );

    count.set(1);
    expect(onError.mock.calls[0][0].message).toContain('MyEffect');
  });
});
