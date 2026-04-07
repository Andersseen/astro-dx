import { signal } from '@astro-dx/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { destroyAll, getElement, getElements } from './get-element.ts';

describe('getElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    destroyAll();
  });

  it('returns an ElementRef for a matching element', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const btn = getElement<HTMLButtonElement>('#btn');
    expect(btn).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(btn!.el).toBeInstanceOf(HTMLButtonElement);
  });

  it('returns null when element not found', () => {
    const result = getElement('#nonexistent');
    expect(result).toBeNull();
  });

  it('text() updates textContent reactively', () => {
    document.body.innerHTML = '<span id="count">0</span>';
    const count = signal(0);
    const span = getElement<HTMLSpanElement>('#count');

    expect(span).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    span!.text(count);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(span!.el.textContent).toBe('0');

    count.set(5);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(span!.el.textContent).toBe('5');
  });

  it('attr() sets and removes attribute reactively', () => {
    document.body.innerHTML = '<button id="btn">Submit</button>';
    const isLoading = signal(false);
    const btn = getElement<HTMLButtonElement>('#btn');

    expect(btn).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.attr('disabled', isLoading);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(btn!.el.hasAttribute('disabled')).toBe(false);

    isLoading.set(true);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(btn!.el.hasAttribute('disabled')).toBe(true);

    isLoading.set(false);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(btn!.el.hasAttribute('disabled')).toBe(false);
  });

  it('cls() toggles class reactively', () => {
    document.body.innerHTML = '<div id="card"></div>';
    const isActive = signal(false);
    const card = getElement<HTMLDivElement>('#card');

    expect(card).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    card!.cls('active', isActive);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(card!.el.classList.contains('active')).toBe(false);

    isActive.set(true);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    expect(card!.el.classList.contains('active')).toBe(true);
  });

  it('on() attaches event listener', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    expect(btn).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.on('click', spy);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('chaining works', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const isLoading = signal(false);
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    expect(btn).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.cls('loading', isLoading).attr('disabled', isLoading).on('click', spy);

    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('destroy() removes event listeners', () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const spy = vi.fn();
    const btn = getElement<HTMLButtonElement>('#btn');

    expect(btn).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.on('click', spy);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.destroy();
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btn!.el.click();
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('destroyAll() cleans all registered refs', () => {
    document.body.innerHTML = '<button id="a">A</button><button id="b">B</button>';
    const spyA = vi.fn();
    const spyB = vi.fn();

    const btnA = getElement('#a');
    const btnB = getElement('#b');

    expect(btnA).not.toBeNull();
    expect(btnB).not.toBeNull();

    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btnA!.on('click', spyA);
    // biome-ignore lint/style/noNonNullAssertion: verified not null above
    btnB!.on('click', spyB);

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
      '<li class="item">A</li><li class="item">B</li><li class="item">C</li>';
    const items = getElements<HTMLLIElement>('.item');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.el.tagName).toBe('LI');
    }
  });

  it('returns empty array when no elements match', () => {
    const items = getElements('.nonexistent');
    expect(items).toEqual([]);
    expect(items).toHaveLength(0);
  });

  it('on() works per element', () => {
    document.body.innerHTML =
      '<li class="item" data-id="1">A</li><li class="item" data-id="2">B</li>';
    const clicked: string[] = [];
    const items = getElements<HTMLLIElement>('.item');

    for (const item of items) {
      item.on('click', () => clicked.push(item.el.dataset.id ?? ''));
    }

    items[0]?.el.dispatchEvent(new MouseEvent('click'));
    items[1]?.el.dispatchEvent(new MouseEvent('click'));

    expect(clicked).toEqual(['1', '2']);
  });
});
