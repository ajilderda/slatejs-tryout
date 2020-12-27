import { Editor, Transforms } from 'slate';

export const withActions = editor => {
  editor.getCurrentAction = () => {
    const { path } = editor.selection.anchor;
    return Editor.fragment(editor, [path[0]])[0];
  }

  editor.mergeAll = (index) => {
    const currentAction = editor.children[index];
    for (let j = currentAction.children.length - 1; j >= 0; j--) {
      Transforms.mergeNodes(editor, {
        at: [index, j],
      });
    }
  }

  editor.createRange = (start, length) => {
    return {
      anchor: {
        path: [0, 0],
        offset: start,
      },
      focus: {
        path: [0, 0],
        offset: start + length,
      },
    }
  }

  return editor;
};
