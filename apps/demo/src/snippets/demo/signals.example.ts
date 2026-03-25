import { computed, signal } from '@astro-dx/core';
import { getElement } from '@astro-dx/dom';
import { onClick } from '@astro-dx/events';

const count = signal(0);
const double = computed(() => count() * 2);

getElement('#count-display').text(count);
getElement('#double-display').text(double);

onClick('#btn-inc', () => count.update((v) => v + 1));
onClick('#btn-dec', () => count.update((v) => v - 1));
