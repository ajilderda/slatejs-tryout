// @refresh reset
/* eslint-disable */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createEditor, Editor, Element, Node, Text, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import styles from './app.module.css';
import { withActions } from './slatePlugins';

const App = () => {
  const editor = useMemo(() => withReact(withActions(createEditor())), []);
  const initialValue = [
    // {
    //   type: 'paragraph',
    //   children: [{ text: 'A line of text in , a paragraph.' }],
    //   children: [{ text: 'A line of text in , a paragraph.' }],
    // },
      {
        type: "action",
        children: [
          {
            text: "Imperdiet hendrerit ligula conubia lorem porttitor",
            type: "default"
          }
        ]
      },
      {
        type: "separator",
        children: [
          {
            text: ""
          }
        ]
      },
      {
        type: "action",
        children: [
          {
            text: "foo"
          },
          {
            type: "action",
            text: "1609074761895"
          },
          {
            type: "operator",
            text: "+"
          },
          {
            type: "value",
            text: "value"
          },
          {
            type: "action",
            text: "16091609074768163"
          },
          {
            type: "operator",
            text: "+"
          },
          {
            type: "value",
            text: "value"
          },
          {
            type: "action",
            text: "074765753"
          },
          {
            type: "operator",
            text: "+"
          },
          {
            type: "value",
            text: "valu"
          },
          {
            type: "action",
            text: "11609074775713"
          },
          {
            type: "operator",
            text: "+"
          },
          {
            type: "value",
            text: "value"
          },
          {
            type: "action",
            text: "609074769738"
          },
          {
            type: "operator",
            text: "+"
          },
          {
            type: "value",
            text: "valueed"
          }
        ]
      }
  ];

  const [value, setValue] = useState(initialValue);

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

      case 'action':
        return <ActionElement {...props} />

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

            const action = {
              type: 'action',
              children: [{text: ''}]
            };

            Transforms.insertNodes(editor, separator);
            Transforms.insertNodes(editor, action);
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

  console.log('getCurrentAction', editor.getCurrentAction());

  const wrapItem = () => {
    // SET PROPERTIES ON TOP LEVEL ITEM
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
        at: editor.createRange(4, 1),
        match: n => Text.isText(n),
        split: true,
      }
    );

    // VALUE
    Transforms.setNodes(editor,
      {type: 'value'},
      {
        at: editor.createRange(5, 3),
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

const ActionElement = props => {
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
