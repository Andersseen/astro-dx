import { atom, computed } from 'nanostores';

const $count = atom(0);
const $double = computed($count, (c) => c * 2);
const $sign = computed($count, (c) => (c > 0 ? 'positive' : c < 0 ? 'negative' : 'neutral'));

$count.subscribe((v) => {
  const el = document.querySelector('#count-display');
  if (el) el.textContent = String(v);
});

$double.subscribe((v) => {
  const el = document.querySelector('#double-display');
  if (el) el.textContent = String(v);
});

$sign.subscribe((v) => {
  const el = document.querySelector('#sign-display');
  if (el) el.textContent = v;
});

document.querySelector('#btn-inc')?.addEventListener('click', () => $count.set($count.get() + 1));

document.querySelector('#btn-dec')?.addEventListener('click', () => $count.set($count.get() - 1));

document.querySelector('#btn-reset')?.addEventListener('click', () => $count.set(0));
