// Core Editor Types
export type InlineStyle = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH' | 'CODE' | 'HIGHLIGHT' | 'SUBSCRIPT' | 'SUPERSCRIPT';

export type BlockType = 'paragraph' | 'header-one' | 'header-two' | 'header-three' | 'unordered-list-item' | 'ordered-list-item' | 'blockquote' | 'code-block' | 'callout';

export type EntityType = 'LINK' | 'COMPONENT' | 'MENTION';

export interface InlineStyleRange {
  style: InlineStyle;
  offset: number;
  length: number;
}

export interface EntityRange {
  key: string;
  offset: number;
  length: number;
  type: EntityType;
}

export interface Block {
  key: string;
  text: string;
  type: BlockType;
  depth: number;
  inlineStyleRanges: InlineStyleRange[];
  entityRanges: EntityRange[];
}

export interface ComponentPosition {
  x: number;
  y: number;
}

export interface ComponentData {
  id?:any
  type: string;
  data: Record<string, any>;
  position: ComponentPosition;
}

export interface MentionData {
  id: string;
  name: string;
  type: string;
  avatarUrl?: string;
  data?: Record<string, any>;
}

export interface SelectionState {
  startKey: string;
  endKey: string;
  startOffset: number;
  endOffset: number;
  hasFocus: boolean;
}

export interface EditorState {
  blocks: Block[];
  selection: SelectionState;
  undoStack: EditorState[];
  redoStack: EditorState[];
  components: Record<string, ComponentData>;
  mentions: Record<string, MentionData>;
}

// Command Types
export type Command = 
  | { type: 'toggleInlineStyle'; style: InlineStyle }
  | { type: 'toggleBlockType'; blockType: BlockType }
  | { type: 'undo' }
  | { type: 'redo' };

// Action Types
export interface TextFormatAction {
  type: 'TOGGLE_INLINE_STYLE';
  style: InlineStyle;
}

export interface BlockFormatAction {
  type: 'TOGGLE_BLOCK_TYPE';
  blockType: BlockType;
}

export interface SetSelectionAction {
  type: 'SET_SELECTION';
  selection: SelectionState;
}

export interface InsertComponentAction {
  type: 'INSERT_COMPONENT';
  id: string;
  component: Omit<ComponentData, 'position'>;
  position?: ComponentPosition;
}

export interface InsertMentionAction {
  type: 'INSERT_MENTION';
  mentionData: MentionData;
}