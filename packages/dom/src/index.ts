export {
  getElement,
  getElements,
  destroyAll,
  getElementOrNull,
  ElementNotFoundError,
} from './get-element.ts';
export { ElementRef } from './element-ref.ts';
export { text, attr, cls } from './bindings.ts';

export { on, onHover, onKey, onFocus } from '@astro-dx/events';
export { register, bootstrap } from '@astro-dx/attributes';
