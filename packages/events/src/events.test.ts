import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  on,
  onChange,
  onClick,
  onFocus,
  onHover,
  onInput,
  onKey,
  onResize,
  onSubmit,
} from './events.ts';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('on()', () => {
  it('attaches click listener', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const spy = vi.fn();

    on('#btn', 'click', spy);
    document.querySelector('#btn')?.dispatchEvent(new MouseEvent('click'));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('extracts value for input events', () => {
    document.body.innerHTML = '<input id="i" />';
    const spy = vi.fn();

    on('#i', 'input', spy);

    const el = document.querySelector<HTMLInputElement>('#i');
    expect(el).not.toBeNull();
    if (el) {
      el.value = 'hello';
      el.dispatchEvent(new Event('input'));
    }

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('returns cleanup function', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const spy = vi.fn();

    const cleanup = on('#btn', 'click', spy);
    cleanup();

    document.querySelector('#btn')?.dispatchEvent(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns no-op for missing selector', () => {
    expect(() => on('#missing', 'click', vi.fn())).not.toThrow();
  });
});

describe('onClick()', () => {
  it('receives MouseEvent', () => {
    document.body.innerHTML = '<button id="btn"></button>';
    const spy = vi.fn();

    onClick('#btn', spy);
    document.querySelector('#btn')?.dispatchEvent(new MouseEvent('click'));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });
});

describe('onInput()', () => {
  it('receives string value', () => {
    document.body.innerHTML = '<input id="i" />';
    const spy = vi.fn();

    onInput('#i', spy);

    const el = document.querySelector<HTMLInputElement>('#i');
    expect(el).not.toBeNull();
    if (el) {
      el.value = 'test';
      el.dispatchEvent(new Event('input'));
    }

    expect(spy).toHaveBeenCalledWith('test');
  });
});

describe('onChange()', () => {
  it('receives string value', () => {
    document.body.innerHTML = '<select id="s"><option value="a">A</option></select>';
    const spy = vi.fn();

    onChange('#s', spy);

    const el = document.querySelector<HTMLSelectElement>('#s');
    expect(el).not.toBeNull();
    if (el) {
      el.value = 'a';
      el.dispatchEvent(new Event('change'));
    }

    expect(spy).toHaveBeenCalledWith('a');
  });
});

describe('onSubmit()', () => {
  it('calls preventDefault automatically', () => {
    document.body.innerHTML = '<form id="f"></form>';
    const spy = vi.fn();

    onSubmit('#f', spy);

    const event = new Event('submit', { cancelable: true });
    document.querySelector('#f')?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('onHover()', () => {
  it('calls enter and leave handlers', () => {
    document.body.innerHTML = '<div id="card"></div>';
    const enter = vi.fn();
    const leave = vi.fn();

    onHover('#card', { enter, leave });

    const el = document.querySelector('#card');
    el?.dispatchEvent(new MouseEvent('mouseenter'));
    el?.dispatchEvent(new MouseEvent('mouseleave'));

    expect(enter).toHaveBeenCalledTimes(1);
    expect(leave).toHaveBeenCalledTimes(1);
  });

  it('works with only enter handler', () => {
    document.body.innerHTML = '<div id="card"></div>';
    const enter = vi.fn();

    expect(() => onHover('#card', { enter })).not.toThrow();
  });

  it('cleanup removes both handlers', () => {
    document.body.innerHTML = '<div id="card"></div>';
    const enter = vi.fn();
    const leave = vi.fn();

    const cleanup = onHover('#card', { enter, leave });
    cleanup();

    const el = document.querySelector('#card');
    el?.dispatchEvent(new MouseEvent('mouseenter'));
    el?.dispatchEvent(new MouseEvent('mouseleave'));

    expect(enter).not.toHaveBeenCalled();
    expect(leave).not.toHaveBeenCalled();
  });
});

describe('onKey()', () => {
  it('fires only for the specified key', () => {
    document.body.innerHTML = '<input id="i" />';
    const spy = vi.fn();

    onKey('#i', 'Enter', spy);

    const el = document.querySelector('#i');
    el?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    el?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('onFocus()', () => {
  it('calls focus and blur handlers', () => {
    document.body.innerHTML = '<input id="i" />';
    const focus = vi.fn();
    const blur = vi.fn();

    onFocus('#i', { focus, blur });

    const el = document.querySelector('#i');
    el?.dispatchEvent(new FocusEvent('focus'));
    el?.dispatchEvent(new FocusEvent('blur'));

    expect(focus).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledTimes(1);
  });
});

describe('onResize()', () => {
  it('observes element resize and cleans up', () => {
    document.body.innerHTML = '<div id="panel"></div>';
    const disconnect = vi.fn();
    const observe = vi.fn();
    const instances: ResizeObserverMock[] = [];
    const spy = vi.fn();

    class ResizeObserverMock {
      private readonly _callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this._callback = callback;
        instances.push(this);
      }

      observe = observe;
      disconnect = disconnect;

      trigger(entry: ResizeObserverEntry): void {
        this._callback([entry], this as unknown as ResizeObserver);
      }
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const cleanup = onResize('#panel', spy);
    expect(observe).toHaveBeenCalledTimes(1);

    const element = document.querySelector('#panel') as Element;
    instances[0]?.trigger({
      target: element,
      contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    });

    expect(spy).toHaveBeenCalledTimes(1);

    cleanup();
    expect(disconnect).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
