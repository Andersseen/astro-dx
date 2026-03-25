import { computed, signal } from '@astro-dx/core';
import { getElement } from '@astro-dx/dom';
import { onClick } from '@astro-dx/events';

const count = signal(0);
const double = computed(() => count() * 2);
const sign = computed(() => (count() > 0 ? 'positive' : count() < 0 ? 'negative' : 'neutral'));

getElement('#count-display').text(count);
getElement('#double-display').text(double);
getElement('#sign-display').text(sign);

onClick('#btn-inc', () => count.update((v) => v + 1));
onClick('#btn-dec', () => count.update((v) => v - 1));
onClick('#btn-reset', () => count.set(0));
