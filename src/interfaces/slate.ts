import { BaseEditor, BaseElement, BaseNode, BaseRange, BaseText, Descendant, Path } from 'slate';

export interface CustomEditor extends BaseEditor {
  getCurrentAction(): Descendant | undefined;
  splitActions(nodes: BaseNode): void;
  mergeAll(index: number): void;
  createRange(start: number, length: number, path?: Path): BaseRange | undefined;
  // transformAction(input): ;
}

interface Separator extends BaseElement {
  type: 'separator';
}

export type SeparatorElement = Omit<Separator, "children">;

export interface CommandElement extends BaseElement {
  type: string;
  action?: string;
  operator?: string;
  value?: string;
  isValid?: boolean;
}

export interface LeafElement extends BaseText {
  type?: string;
}