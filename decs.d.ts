declare module "slate" {
  export interface CustomTypes {
    Editor:
      | CustomEditor
    Element:
      | SeparatorElement
      | CommandElement
    Text:
      LeafElement
  }
}