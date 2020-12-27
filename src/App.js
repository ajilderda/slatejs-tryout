// @refresh reset
/* eslint-disable */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createEditor, Editor, Node, Path, Point, PointRef, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate, useSelected, ReactEditor } from 'slate-react';
import styles from './app.module.css';

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in , a paragraph.' }],
    },
  ];

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    console.log('[UPDATED]', value);
  }, [value]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />

      case 'separator':
        return <SeparatorElement {...props} />

      case 'action':
        return <ActionElement {...props} />

      default:
        return <DefaultElement {...props} />
    }
  });

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Position />
      <Editable
        renderElement={renderElement}
        onKeyDown={(event) => {

          if (event.key === ',') {
            event.preventDefault();

            const separator = {
              type: 'separator',
              children: [{text: ''}]
            };

            const action = {
              type: 'action',
              children: [{text: ''}]
            };

            Transforms.insertNodes(editor, separator);
            Transforms.insertNodes(editor, action);

            // const { anchor } = editor.selection;
            // Transforms.splitNodes(
            //   editor,
            //   {
            //     match: n => Editor.isBlock(editor, n),
            //     at: anchor
            //   }
            // )

          }
          if (!event.ctrlKey) {
            return;
          }

          if (event.key === ',' && event.ctrlKey) {
            event.preventDefault();
            // determine the type of the current block
            const [match] = Editor.nodes(editor, {
              match: n => n.type === 'code',
            })

            Transforms.setNodes(
              editor,
              { type: match ? 'paragraph' : 'code' },
              {
                match: n => Editor.isBlock(editor, n),
                at: [0]
              }
            )
          }
        }}
      />
    </Slate>
  );
}

const Position = props => {
  const editor = useSlate();

  if (!editor?.selection) return '';
  const { path, offset } = editor?.selection?.anchor;
  const nodeType = editor.children[path[0]]?.type;

  // Easier, but the text property is missing
  // console.log('fragment', editor.getFragment());
  const node = Node.get(editor, path);
  const { text } = node;
  const nodes = PointRef;
  const gen = Node.elements(editor);

  Transforms.setNodes(editor, {
    value: text[0],
  });

  const deleteItem = () => {
    Transforms.delete(editor, {
      at: path,
      unit: 'block',
      hanging: true,
      voids: true
    });
  }

  return (
    <>
      path: {path.toString()}
      <br />
      offset: {offset}
      <br />
      type: {nodeType}
      <br />
      text: {text}
      <br />
      <button onClick={deleteItem}>Delete</button>
      <br />
    </>
  )
}

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const SeparatorElement = props => {
  return (
    <span contentEditable={false} style={{background: 'red'}} {...props.attributes}>
      ,
      {props.children}
    </span>
    )
}

const ActionElement = props => {
  return (
    <span style={{background: 'yellow'}} {...props.attributes}>
      <span style={{background: 'green', color: 'white'}}>{props.element.value}</span>
      {props.children}
    </span>
    )
}

const DefaultElement = props => {
  return <span {...props.attributes}>{props.children}</span>
}

export default App;
