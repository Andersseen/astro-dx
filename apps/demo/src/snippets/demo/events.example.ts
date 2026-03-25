import { signal } from '@astro-dx/core';
import { onFocus, onHover, onInput, onKey, onResize, onSubmit } from '@astro-dx/events';

const query = signal('');
const status = signal('idle');
const hoverState = signal('outside');
const focusState = signal('blurred');
const boxSize = signal('waiting resize...');

onInput('#search-input', (value) => query.set(value));
onSubmit('#search-form', () => status.set(`submit:${query()}`));
onKey('#search-input', 'Enter', () => status.set(`enter:${query()}`));

onHover('#hover-zone', {
  enter: () => hoverState.set('inside'),
  leave: () => hoverState.set('outside'),
});

onFocus('#focus-input', {
  focus: () => focusState.set('focused'),
  blur: () => focusState.set('blurred'),
});

onResize('#resizable-box', (entry) => {
  const width = Math.round(entry.contentRect.width);
  const height = Math.round(entry.contentRect.height);
  boxSize.set(`${width} x ${height}`);
});
