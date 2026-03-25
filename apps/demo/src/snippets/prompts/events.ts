export const eventsContext = `<astro-dx-events>
## @astro-dx/events
Standalone, type-safe event binding helpers. Each function returns a cleanup function \`() => void\`.
Target can be a CSS selector string, Element, Document, or Window.

| Function | Signature | Notes |
|----------|-----------|-------|
| on(target, event, fn, options?) | (Target, string, (value or Event) => void) => () => void | For input/change/keyup/keydown/keypress: fn receives the input value string. For all other events: fn receives the raw Event |
| onClick(target, fn, options?) | (Target, (MouseEvent) => void) => () => void | Click shorthand |
| onInput(target, fn) | (Target, (string) => void) => () => void | Input event, auto-extracts .value |
| onChange(target, fn) | (Target, (string) => void) => () => void | Change event, auto-extracts .value |
| onSubmit(target, fn) | (Target, (SubmitEvent) => void) => () => void | Auto-calls preventDefault() |
| onHover(target, handlers) | (Target, { enter?, leave? }) => () => void | mouseenter / mouseleave pair |
| onKey(target, key, fn) | (Target, string, (KeyboardEvent) => void) => () => void | Keydown for a specific key (e.g. 'Enter', 'Escape') |
| onFocus(target, handlers) | (Target, { focus?, blur? }) => () => void | focus / blur pair |
| onResize(target, fn) | (Target, (ResizeObserverEntry) => void) => () => void | Uses ResizeObserver. Target must resolve to an Element |

### Examples

\`\`\`ts
import { onInput, onClick, onKey, onSubmit, onResize } from '@astro-dx/events';


const cleanupInput = onInput('#search', (val) => query.set(val));


const cleanupClick = onClick('#submit-btn', (e) => {

});


const cleanupEsc = onKey(window, 'Escape', () => {
  menuOpen.set(false);
});


const cleanupForm = onSubmit('#my-form', (e) => {
  const formData = new FormData(e.target as HTMLFormElement);
  
});


const cleanupResize = onResize('#container', (entry) => {
  const { width, height } = entry.contentRect;

});


onBeforeSwap(() => {
  cleanupInput();
  cleanupClick();
  cleanupEsc();
  cleanupForm();
  cleanupResize();
});
\`\`\`
</astro-dx-events>`;
