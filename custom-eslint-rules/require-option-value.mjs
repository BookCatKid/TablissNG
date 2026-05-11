const requireOptionValueRule = {
  meta: {
    type: "problem",
    docs: {
      description: "require value prop on <option> elements",
    },
    schema: [],
    messages: {
      missingValue: "<option> must have a 'value' prop.",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        if (node.name.name !== "option") return;

        const hasSpread = node.attributes.some(
          (attr) => attr.type === "JSXSpreadAttribute",
        );
        if (hasSpread) return;

        const hasValue = node.attributes.some(
          (attr) => attr.type === "JSXAttribute" && attr.name.name === "value",
        );

        if (!hasValue) {
          context.report({
            node,
            messageId: "missingValue",
          });
        }
      },
    };
  },
};

export default requireOptionValueRule;
