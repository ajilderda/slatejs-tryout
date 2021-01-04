// @refresh reset
/* eslint-disable */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BaseText, createEditor, Editor, Element, Text, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { CommandElement, CustomEditor, LeafElement } from './interfaces/slate';
import { withActions } from './slatePlugins';

const App = () => {
  const editor = useMemo(() => withReact(withActions(createEditor() as CustomEditor)), []);
  const initialValue: CommandElement = {
    type: 'command',
    children: [{ text: 'A line of text in , a p, ,aragraph.' }],
  };

  const [value, setValue] = useState<any>([initialValue]);

  // split initial value
  useEffect(() => editor.splitActions(initialValue), []);

  useEffect(() => {
    if (!editor?.selection) { return undefined };
    console.log('[UPDATED]', value);
  }, [value]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'separator':
        return <SeparatorNode {...props} />

      case 'command':
        return <CommandNode {...props} />

      default:
        return <DefaultNode {...props} />
    }
  }, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === ',') {
            event.preventDefault();

            const separator = {
              type: 'separator',
              children: [{text: ''}]
            };

            const command = {
              type: 'command',
              children: [{text: ''}]
            };

            Transforms.insertNodes(editor, separator);
            Transforms.insertNodes(editor, command);
          }
          if (!event.ctrlKey) {
            return;
          }
        }}
      />
      <br />
      <Position />
    </Slate>
  );
}

const Position = () => {
  const editor = useSlate() as unknown as CustomEditor;

  if (!editor?.selection) return null;

  const { path, offset } = editor?.selection?.anchor;
  const node = Editor.node(editor, path);

  // const { type } = fragment[0];
  const { text } = node as unknown as BaseText;
  // const text = undefined

  // // Get properties of current leaf
  const mark = Editor.marks(editor) as LeafElement;

  // console.log('getCurrentAction', editor.getCurrentAction());
  // console.log('last', Node.last(fragment[0], [0])[0]);
  // Node.texts(editor.getCurrentAction(), path).next().value

  // console.log('Match?', Text.matches(node, {type: 'operator'}));

  const wrapItem = () => {
    // SET PROPERTIES ON TOP LEVEL ITEM
    console.log('editor.getCurrentAction()', editor.getCurrentAction());
    console.log('path', path);

    Transforms.setNodes(editor,
      {
        //@ts-ignore
        type: 'command',
        action: 'lr',
        operator: '+',
        value: '100',
        isValid: true,
      },
      {
        at: path,
        match: n => Element.isElement(n),
        split: true,
      }
    );

    // ACTION
    Transforms.setNodes(editor,
      //@ts-ignore
      {type: 'action'},
      {
        at: editor.createRange(0, 3),
        match: n => Text.isText(n),
        split: true,
      }
    );

    // OPERATOR
    Transforms.setNodes(editor,
      //@ts-ignore
      {type: 'operator'},
      {
        at: editor.createRange(3, 1),
        match: n => Text.isText(n),
        split: true,
      }
    );

    // VALUE
    Transforms.setNodes(editor,
      //@ts-ignore
      {type: 'value'},
      {
        at: editor.createRange(4, 3),
        match: n => Text.isText(n),
        split: true,
      }
    );
    //@ts-check

    // ALTERNATIVE APPROACH WOULD BE TO INSERT NODES AND FLUSH THE ORIGINAL ONE
    // (might cause issues with caret position)

    // const action = {
    //   type: 'action',
    //   text: Date.now().toString()
    // };
    // const operator = {
    //   type: 'operator',
    //   text: '+'
    // };
    // const value = {
    //   type: 'value',
    //   // text: 'value'
    // };

    // Transforms.insertNodes(editor, [action, operator, value]);
  }


  const deleteItem = () => {
    Transforms.delete(editor, {
      at: path,
      unit: 'block',
      hanging: true,
      voids: true
    });
    // or
    // editor.deleteFragment()
  }

  return (
    <>
      <button onClick={deleteItem}>Delete</button>
      <button onClick={wrapItem}>Wrap</button>
      <br />
      <br />
      path: {path.toString()}
      <br />
      offset: {offset}
      <br />
      {/* type: {type} */}
      <br />
      text: {text}
      <br />
      mark: {mark?.type}
      <br />
      fragment:
      <div><pre>{JSON.stringify(editor.getCurrentAction(), null, 2) }</pre></div>
      <br />
    </>
  )
}

const SeparatorNode = (props: any) => {
  return (
    <span contentEditable={false} style={{background: 'red'}} {...props.attributes}>
      ,
      {props.children}
    </span>
    )
}

const CommandNode = (props: any) => {
  return (
    <p style={{background: 'yellow'}} {...props.attributes}>
      {props.children}
    </p>
    )
}

const DefaultNode = (props: any) => {
  return <p {...props.attributes}>{props.children}</p>
}

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  return <span {...attributes}>{children}</span>
}

export default App;
