import { defineMessages } from "react-intl";

export const messages = defineMessages({
  name: {
    id: "plugins.tallyCounter.name",
    defaultMessage: "Tally Counter",
    description: "Name of the Tally Counter widget",
  },
  description: {
    id: "plugins.tallyCounter.description",
    defaultMessage: "Keep track of counts with a simple clicker.",
    description: "Description of the Tally Counter widget",
  },
  label: {
    id: "plugins.tallyCounter.label",
    defaultMessage: "Label",
    description: "Input label for giving the tally counter a name",
  },
  labelPlaceholder: {
    id: "plugins.tallyCounter.labelPlaceholder",
    defaultMessage: "What are you counting?",
    description: "Placeholder text inside the label input field",
  },
  step: {
    id: "plugins.tallyCounter.step",
    defaultMessage: "Step",
    description: "Label for setting the increment step amount",
  },
  setCount: {
    id: "plugins.tallyCounter.setCount",
    defaultMessage: "Set count",
    description: "Label for manually setting the current count value",
  },
  showReset: {
    id: "plugins.tallyCounter.showReset",
    defaultMessage: "Show reset button",
    description: "Checkbox label for toggling visibility of the reset button",
  },
  increment: {
    id: "plugins.tallyCounter.increment",
    defaultMessage: "Increment",
    description: "Screen reader text for the increment button",
  },
  decrement: {
    id: "plugins.tallyCounter.decrement",
    defaultMessage: "Decrement",
    description: "Screen reader text for the decrement button",
  },
  reset: {
    id: "plugins.tallyCounter.reset",
    defaultMessage: "Reset",
    description: "Screen reader text for the reset counter button",
  },
});
