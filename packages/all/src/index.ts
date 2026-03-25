export * from '@astro-dx/core';
export {
  getElement,
  getElements,
  destroyAll,
  ElementRef,
  text,
  attr,
  cls,
  on,
  onHover,
  onKey,
  onFocus,
  register as registerAttributes,
  bootstrap,
} from '@astro-dx/dom';

export {
  register as registerElements,
  DxShow,
  DxIf,
  DxFor,
} from '@astro-dx/elements';
