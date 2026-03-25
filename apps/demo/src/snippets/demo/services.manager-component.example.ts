import { inject } from '@astro-dx/core';
import { getElement } from '@astro-dx/dom';
import { onClick } from '@astro-dx/events';
import { CounterServiceClass } from '../../services/counter.service';

const counter = inject(CounterServiceClass);

getElement('#count-value').text(counter.count);

onClick('#btn-inc', () => counter.increment());
onClick('#btn-dec', () => counter.decrement());
onClick('#btn-reset', () => counter.reset());
