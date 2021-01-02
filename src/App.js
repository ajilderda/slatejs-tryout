// @refresh reset
/* eslint-disable */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createEditor, Editor, Element, Node, Text, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import styles from './app.module.css';
import { withActions } from './slatePlugins';

const App = () => {
  const editor = useMemo(() => withReact(withActions(createEditor())), []);
  const initialValue = {
    type: 'command',
    children: [{ text: 'A line of text in , a p, ,aragraph.' }],
  };

  const [value, setValue] = useState([initialValue]);

  // split initial value
  useEffect(() => editor.splitActions(initialValue), []);

  useEffect(() => {
    if (!editor?.selection) return '';
    const { path, offset } = editor?.selection?.anchor;
    console.log('[UPDATED]', value);

    const node = Node.get(editor, path);
    const { text } = node;

    if (text[0] === 'b') {
      // addMark(editor, 'bold');
      Editor.addMark(editor, 'bold', true)
    };
  }, [value]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'separator':
        return <SeparatorElement {...props} />

      case 'command':
        return <CommandElement {...props} />

      default:
        return <DefaultElement {...props} />
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

const Position = props => {
  const editor = useSlate();

  if (!editor?.selection) return '';

  const { path, offset } = editor?.selection?.anchor;
  const node = Node.get(editor, path);
  const fragment = Editor.fragment(editor, path);

  const { type } = fragment[0];
  const { text } = node;

  // // Get properties of current leaf
  const mark = Editor.marks(editor);

  // console.log('getCurrentAction', editor.getCurrentAction());
  // console.log('last', Node.last(fragment[0], [0])[0]);
  // Node.texts(editor.getCurrentAction(), path).next().value

  console.log('Match?', Text.matches(node, {type: 'operator'}));

  const wrapItem = () => {
    // SET PROPERTIES ON TOP LEVEL ITEM
    console.log('editor.getCurrentAction(', editor.getCurrentAction());
    console.log('path', path);
    Transforms.setNodes(editor,
      {
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
      {type: 'action'},
      {
        at: editor.createRange(0, 3),
        match: n => Text.isText(n),
        split: true,
      }
    );

    // OPERATOR
    Transforms.setNodes(editor,
      {type: 'operator'},
      {
        at: editor.createRange(3, 1),
        match: n => Text.isText(n),
        split: true,
      }
    );

    // VALUE
    Transforms.setNodes(editor,
      {type: 'value'},
      {
        at: editor.createRange(4, 3),
        match: n => Text.isText(n),
        split: true,
      }
    );

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
      type: {type}
      <br />
      text: {text}
      <br />
      mark: {mark.type}
      <br />
      fragment:
      <div><pre>{JSON.stringify(editor.getCurrentAction(), null, 2) }</pre></div>
      <br />
    </>
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

const CommandElement = props => {
  return (
    <p style={{background: 'yellow'}} {...props.attributes}>
      {props.children}
    </p>
    )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  return <span {...attributes}>{children}</span>
}

export default App;
