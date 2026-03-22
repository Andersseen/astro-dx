export const attributesContext = `<astro-dx-attributes>
## @astro-dx/attributes & @astro-dx/elements
Two approaches to declarative DOM rendering: HTML attribute directives and custom elements.
Both require signals to be registered on \`window.__dx__\` via \`register()\`.

### Setup (required for both approaches)
\`\`\`ts
import { signal } from '@astro-dx/core';
import { register, bootstrap } from '@astro-dx/attributes';

const isLoggedIn = signal(false);
const items = signal([
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
]);

// Expose signals globally
register({ isLoggedIn, items });

// Scan DOM and activate dx-if, dx-show, dx-for attributes
bootstrap();
\`\`\`

---

### Approach 1: Attribute directives (via @astro-dx/attributes)
Apply directives as HTML attributes. Requires \`bootstrap()\` after signals are registered.

#### dx-if
Conditionally mounts/unmounts the element from the DOM based on a registered signal's truthiness.
\`\`\`html
<div dx-if="isLoggedIn">Welcome back!</div>
\`\`\`

#### dx-show
Toggles the element's \`hidden\` property. Element stays in the DOM.
\`\`\`html
<div dx-show="isLoggedIn">Your profile</div>
\`\`\`

#### dx-for
Iterates over an array signal. The element with \`dx-for\` becomes the template and is cloned for each item.
Use \`dx-text\`, \`dx-attr\`, and \`dx-class\` inside children for per-item bindings.
Optional \`dx-key\` for keyed reconciliation.

\`\`\`html
<li dx-for="items" dx-key="id">
  <span dx-text="name"></span>
  <a dx-attr="href:url">Link</a>
  <span dx-class="active:isActive"></span>
</li>
\`\`\`

Per-item binding attributes:
| Attribute | Syntax | Description |
|-----------|--------|-------------|
| dx-text | dx-text="fieldName" | Sets textContent to item[fieldName] |
| dx-attr | dx-attr="attrName:fieldName" | Sets attribute to item[fieldName] |
| dx-class | dx-class="className:fieldName" | Toggles CSS class based on Boolean(item[fieldName]) |

---

### Approach 2: Custom elements (via @astro-dx/elements)
Use \`<dx-if>\`, \`<dx-show>\`, \`<dx-for>\` as custom elements. They self-register and require \`signal\` attribute.
Does NOT require calling \`bootstrap()\`.

#### <dx-if signal="signalName">
\`\`\`html
<dx-if signal="isLoggedIn">
  <p>Welcome back!</p>
</dx-if>
\`\`\`

#### <dx-show signal="signalName">
\`\`\`html
<dx-show signal="isLoggedIn">
  <p>Your profile</p>
</dx-show>
\`\`\`

#### <dx-for signal="signalName" key="id">
Content inside becomes the template. First child element is cloned per item.
Uses same \`dx-text\`, \`dx-attr\`, \`dx-class\` bindings.

\`\`\`html
<dx-for signal="items" key="id">
  <div>
    <span dx-text="name"></span>
    <a dx-attr="href:url">Visit</a>
  </div>
</dx-for>
\`\`\`

---

### Which approach to use?
| Criteria | Attributes (\`dx-if\`) | Elements (\`<dx-if>\`) |
|----------|----------------------|----------------------|
| Requires bootstrap() | Yes | No |
| Works without JS import | No (needs bootstrap) | Yes (auto-registers) |
| Can style wrapper | No extra wrapper | Element is the wrapper |
| Better for | Lighter DOM, no wrappers | Cleaner separation |
</astro-dx-attributes>`;
