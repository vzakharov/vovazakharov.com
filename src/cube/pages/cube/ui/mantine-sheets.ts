// The cube's route has no Mantine root of its own, so its dialogs bring their
// provider and, from here, the sheets of what they render, in Mantine's own
// order (`.claude/rules/styling.md`). One module holds them all so two dialogs
// cannot import them in two orders. They are the unlayered halves on purpose:
// a module the shell's theme provider also imports becomes a CSS chunk Next
// shares between the two, linked on every shell page after the shell's own,
// which loads `Button` after `Title` there.
import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/global.css';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/Overlay.css';
import '@mantine/core/styles/CloseButton.css';
import '@mantine/core/styles/Group.css';
import '@mantine/core/styles/ModalBase.css';
import '@mantine/core/styles/Input.css';
import '@mantine/core/styles/Text.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/Modal.css';
import '@mantine/core/styles/Stack.css';
