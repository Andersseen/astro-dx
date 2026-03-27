import { signal } from '@astro-dx/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ElementNotFoundError,
  destroyAll,
  getElement,
  getElementOrNull,
  getElements,
} from './get-element.ts';

describe('getElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    destroyAll();
  });

  it('returns an ElementRef for a matching element', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const btn = getElement<HTMLButtonElement>('#btn');
    expect(btn.el).toBeInstanceOf(HTMLButtonElement);
  });

  it('text() updates textContent reactively', () => {
    document.body.innerHTML = '<span id="count">0</span>';
    const count = signal(0);
    const span = getElement<HTMLSpanElement>('#count');

    span.text(count);
    expect(span.el.textContent).toBe('0');

    count.set(5);
    expect(span.el.textContent).toBe('5');
  });

  it('attr() sets and removes attribute reactively', () => {
    document.body.innerHTML = '<button id="btn">Submit</button>';
    const isLoading = signal(false);
    const btn = getElement<HTMLButtonElement>('#btn');

    btn.attr('disabled', isLoading);
    expect(btn.el.hasAttribute('disabled')).toBe(false);

    isLoading.set(true);
    expect(btn.el.hasAttribute('disabled')).toBe(true);

    isLoading.set(false);
    expect(btn.el.hasAttribute('disabled')).toBe(false);
  });

  it('cls() toggles class reactively', () => {
    document.body.innerHTML = '<div id="card"></div>';
    const isActive = signal(false);
    const card = getElement<HTMLDivElement>('#card');

    card.cls('active', isActive);
    expect(card.el.classList.contains('active')).toBe(false);

    isActive.set(true);
    expect(card.el.classList.contains('active')).toBe(true);
  });

  it('on() attaches event listener', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    btn.on('click', spy);
    btn.el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('chaining works', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const isLoading = signal(false);
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    btn.cls('loading', isLoading).attr('disabled', isLoading).on('click', spy);

    btn.el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('destroy() removes event listeners', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    btn.on('click', spy);
    btn.destroy();
    btn.el.click();
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('destroyAll() cleans all registered refs', () => {
    document.body.innerHTML =
      '\n      <button id="a">A</button>\n      <button id="b">B</button>\n    ';
    const spyA = vi.fn();
    const spyB = vi.fn();

    getElement('#a').on('click', spyA);
    getElement('#b').on('click', spyB);

    destroyAll();

    document.querySelector<HTMLButtonElement>('#a')?.click();
    document.querySelector<HTMLButtonElement>('#b')?.click();

    expect(spyA).toHaveBeenCalledTimes(0);
    expect(spyB).toHaveBeenCalledTimes(0);
  });
});

describe('getElements', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    destroyAll();
  });

  it('returns refs for all matching elements', () => {
    document.body.innerHTML =
      '\n      <li class="item">A</li>\n      <li class="item">B</li>\n      <li class="item">C</li>\n    ';
    const items = getElements<HTMLLIElement>('.item');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.el.tagName).toBe('LI');
    }
  });

  it('on() works per element', () => {
    document.body.innerHTML =
      '\n      <li class="item" data-id="1">A</li>\n      <li class="item" data-id="2">B</li>\n    ';
    const clicked: string[] = [];
    const items = getElements<HTMLLIElement>('.item');

    for (const item of items) {
      item.on('click', () => clicked.push(item.el.dataset.id ?? ''));
    }

    items[0]?.el.dispatchEvent(new MouseEvent('click'));
    items[1]?.el.dispatchEvent(new MouseEvent('click'));

    expect(clicked).toEqual(['1', '2']);
  });

  it('throws ElementNotFoundError when element not found', () => {
    expect(() => getElement('#nonexistent')).toThrow(ElementNotFoundError);
    expect(() => getElement('#nonexistent')).toThrow(
      '[astro-dx] Element with selector "#nonexistent" not found'
    );
  });

  it('getElementOrNull returns null when element not found', () => {
    const result = getElementOrNull('#nonexistent');
    expect(result).toBeNull();
  });

  it('getElementOrNull returns ElementRef when element exists', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const result = getElementOrNull<HTMLButtonElement>('#btn');
    expect(result).not.toBeNull();
    expect(result?.el).toBeInstanceOf(HTMLButtonElement);
  });
});
