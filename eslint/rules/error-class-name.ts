import type { Rule } from 'eslint';

// `const PricingError = errorClass('PricingError')` spells the name twice: the
// code reads the constant, a stack trace prints the argument. Nothing ties the
// two, so a rename of the constant leaves traces naming a class no file
// declares. Flags an `errorClass` call whose argument is not a string literal
// equal to the constant it initializes; the fix writes the constant's name in.
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Require `errorClass(name)` to be given the name of the constant it initializes',
    },
    schema: [],
    messages: {
      mismatch:
        '`{{constant}}` is created as `errorClass({{argument}})`, so its errors report a name no code reads. Pass `{{quoted}}`.',
    },
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        const { id, init } = node;
        if (
          id.type !== 'Identifier' ||
          init?.type !== 'CallExpression' ||
          init.callee.type !== 'Identifier' ||
          init.callee.name !== 'errorClass'
        ) {
          return;
        }
        const [argument] = init.arguments;
        if (argument?.type === 'Literal' && argument.value === id.name) return;
        const quoted = `'${id.name}'`;
        context.report({
          node: argument ?? init,
          messageId: 'mismatch',
          data: {
            constant: id.name,
            argument:
              argument === undefined
                ? ''
                : context.sourceCode.getText(argument),
            quoted,
          },
          fix: (fixer) =>
            argument === undefined
              ? fixer.replaceText(init, `errorClass(${quoted})`)
              : fixer.replaceText(argument, quoted),
        });
      },
    };
  },
};

export default rule;
