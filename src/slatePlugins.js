import { Element, Node, Transforms } from 'slate';
import regex from './utils/regex';

export const withActions = editor => {
  editor.splitActions = (nodes) => {
    const nodeGen = Node.nodes(nodes);
    for (let node of nodeGen) {
      const path = node[1];
      if (!path.length) continue;
      console.log('path', path);
      console.log(node);

      const commaRegex = /,/gm;
      const {text} = node[0];

      for (let comma of regex.execAll(commaRegex, text).reverse()) {
        const range = editor.createRange(comma.index, comma.length, path);

        Transforms.setNodes(editor,
          { type: 'separator' },
          {
            at: range,
            match: n => Element.isElement(n),
            split: true,
          }
        );
      }
    }

    // gen.next.value();
    for (let node of nodes.children) {
      // console.log(node);
      const commaRegex = /,/gm;
      console.log(commaRegex.exec(node.text))
    }

    // Transforms.setNodes(editor,
    //   {
    //     type: 'command',
    //     action: 'lr',
    //     operator: '+',
    //     value: '100',
    //     isValid: true,
    //   },
    //   {
    //     at: path,
    //     match: n => Element.isElement(n),
    //     split: true,
    //   }
    // );
  }

  editor.transformAction = (input) => {

    return input;
  }

  editor.getCurrentAction = () => {
    const { path } = editor?.selection?.anchor;
    if (!path) return undefined;

    return editor.children[path[0]];
    // return Editor.fragment(editor, [path[0]])[0]; // does the same
  }

  editor.mergeAll = (index) => {
    const currentAction = editor.children[index];
    for (let j = currentAction.children.length - 1; j >= 0; j--) {
      Transforms.mergeNodes(editor, {
        at: [index, j],
      });
    }
  }

  editor.createRange = (start, length, path = editor?.selection?.anchor.path) => {
    if (!path) return undefined;

    const topLevelPath = path[0];

    return {
      anchor: {
        path: [topLevelPath, 0],
        offset: start,
      },
      focus: {
        path: [topLevelPath, 0],
        offset: start + length,
      },
    }
  }

  return editor;
};
