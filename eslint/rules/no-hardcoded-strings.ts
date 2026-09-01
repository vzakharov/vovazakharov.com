import type { Rule } from 'eslint';
import type { JSXAttribute } from 'estree-jsx';

/**
 * Disallow hardcoded string literals on user-facing JSX props.
 *
 * User-facing copy belongs in `messages/en.json` and `messages/ru.json`, read
 * through next-intl's `useTranslations`/`getTranslations`. A literal in JSX is
 * rendered verbatim in both locales, so it silently defeats the `ru` catalog.
 */
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded string literals on user-facing JSX attributes (title, label, placeholder, etc.)',
    },
    schema: [],
    messages: {
      noHardcodedString:
        'User-facing string "{{value}}" should come from messages/*.json via useTranslations(), not a hardcoded literal — a literal renders untranslated in every locale.',
    },
  },

  create(context) {
    // Props that typically contain user-facing copy.
    const USER_FACING_PROPS = new Set([
      'title',
      'label',
      'placeholder',
      'subtitle',
      'description',
      'aria-label',
      'aria-placeholder',
      'submitLabel',
      'navPrompt',
      'navLinkText',
      'alt',
      'message',
    ]);

    // Props that look like they could be user-facing but aren't.
    // (Kept here as documentation of what we intentionally skip.)
    // className, href, type, role, variant, color, component, autoComplete,
    // data-testid, key, id, name, htmlFor, as, src, alt (handled by jsx-a11y),
    // size, radius, gap, fz, fw, lh, ta, c, bg, ...

    return {
      JSXAttribute(node: JSXAttribute & Rule.NodeParentExtension) {
        // Only check attributes whose name is in our set.
        const propName =
          node.name.type === 'JSXIdentifier'
            ? node.name.name
            : // JSXNamespacedName (e.g. aria-label) — join namespace:name
              `${node.name.namespace.name}-${node.name.name.name}`;

        if (!USER_FACING_PROPS.has(propName)) return;

        // Only flag string literal values: prop="string"
        // Skip expressions: prop={CONSTANT}, prop={t('key')}, prop={`template`}
        const { value } = node;
        if (value === null) return; // boolean prop, e.g. <Input label />
        if (value.type !== 'Literal') return;
        if (typeof value.value !== 'string') return;
        const literalValue = value.value;

        // Empty alt="" is only valid when the element is also aria-hidden
        // (decorative image). Allow it there; flag it anywhere else.
        if (propName === 'alt' && literalValue === '') {
          if (hasAriaHidden(node.parent)) return;
          context.report({
            node: value,
            messageId: 'noHardcodedString',
            data: { value: '' },
          });
          return;
        }

        // Skip placeholders that are purely visual (dots, bullets, whitespace).
        if (/^[\s.·•…]*$/.test(literalValue)) return;

        context.report({
          node: value,
          messageId: 'noHardcodedString',
          data: { value: truncate(literalValue, 40) },
        });
      },
    };
  },
};

function truncate(string: string, maxLength: number): string {
  return string.length > maxLength
    ? `${string.slice(0, maxLength - 1)}…`
    : string;
}

/**
 * True when the JSXOpeningElement carries `aria-hidden` either as a boolean
 * shorthand (`aria-hidden`), the literal string `"true"`, or the JS expression
 * `{true}`. Used to allow `alt=""` only on decorative images.
 */
function hasAriaHidden(parent: Rule.Node | null | undefined): boolean {
  if (parent === undefined || parent === null) return false;
  if (parent.type !== 'JSXOpeningElement') return false;
  return parent.attributes.some((attr) => {
    if (attr.type !== 'JSXAttribute') return false;
    const name =
      attr.name.type === 'JSXIdentifier'
        ? attr.name.name
        : `${attr.name.namespace.name}-${attr.name.name.name}`;
    if (name !== 'aria-hidden') return false;
    if (attr.value === null) return true; // shorthand: aria-hidden
    if (attr.value.type === 'Literal') return attr.value.value === 'true';
    if (
      attr.value.type === 'JSXExpressionContainer' &&
      attr.value.expression.type === 'Literal'
    ) {
      return attr.value.expression.value === true;
    }
    return false;
  });
}

export default rule;
