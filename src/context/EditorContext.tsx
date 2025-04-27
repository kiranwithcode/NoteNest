import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  EditorState, 
  Command, 
  SelectionState, 
  BlockType, 
  InlineStyle,
  TextFormatAction,
  BlockFormatAction,
  SetSelectionAction,
  InsertComponentAction,
  MentionData,
  InsertMentionAction
} from '../types/editor';

type EditorAction = 
  | TextFormatAction
  | BlockFormatAction
  | SetSelectionAction
  | InsertComponentAction
  | InsertMentionAction
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  executeCommand: (command: Command) => void;
  toggleInlineStyle: (style: InlineStyle) => void;
  toggleBlockType: (blockType: BlockType) => void;
  updateSelection: (selection: SelectionState) => void;
  insertMention: (mentionData: MentionData) => void;
}

const initialSelection: SelectionState = {
  startOffset: 0,
  endOffset: 0,
  startKey: '',
  endKey: '',
  hasFocus: false,
};

const initialState: EditorState = {
  blocks: [
    {
      key: 'block-1',
      text: 'Start writing here...',
      type: 'paragraph',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
  ],
  selection: initialSelection,
  undoStack: [],
  redoStack: [],
  components: {},
  mentions: {},
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'TOGGLE_INLINE_STYLE': {
      // Save current state to undo stack
      const newUndoStack = [...state.undoStack, state];
      
      const { style } = action;
      const { selection } = state;
      const { startKey, startOffset, endKey, endOffset } = selection;
      
      // For simplicity, assuming working within a single block for now
      if (startKey === endKey) {
        const blockIndex = state.blocks.findIndex((block) => block.key === startKey);
        if (blockIndex === -1) return state;
        
        const block = state.blocks[blockIndex];
        
        // Check if style already exists in the range
        const existingStyleRange = block.inlineStyleRanges.find(
          (range) => 
            range.style === style && 
            range.offset <= startOffset && 
            (range.offset + range.length) >= endOffset
        );
        
        let updatedInlineStyleRanges;
        
        if (existingStyleRange) {
          // Remove or split the existing style range
          updatedInlineStyleRanges = block.inlineStyleRanges.filter(
            (range) => range !== existingStyleRange
          );
          
          // If the selection is within the style range, split it
          if (startOffset > existingStyleRange.offset || endOffset < (existingStyleRange.offset + existingStyleRange.length)) {
            // Create before segment if needed
            if (startOffset > existingStyleRange.offset) {
              updatedInlineStyleRanges.push({
                style,
                offset: existingStyleRange.offset,
                length: startOffset - existingStyleRange.offset,
              });
            }
            
            // Create after segment if needed
            if (endOffset < (existingStyleRange.offset + existingStyleRange.length)) {
              updatedInlineStyleRanges.push({
                style,
                offset: endOffset,
                length: (existingStyleRange.offset + existingStyleRange.length) - endOffset,
              });
            }
          }
        } else {
          // Add new style range
          updatedInlineStyleRanges = [
            ...block.inlineStyleRanges,
            {
              style,
              offset: startOffset,
              length: endOffset - startOffset,
            },
          ];
        }
        
        const updatedBlocks = [...state.blocks];
        updatedBlocks[blockIndex] = {
          ...block,
          inlineStyleRanges: updatedInlineStyleRanges,
        };
        
        return {
          ...state,
          blocks: updatedBlocks,
          undoStack: newUndoStack,
          redoStack: [],
        };
      }
      
      return state;
    }
    
    case 'TOGGLE_BLOCK_TYPE': {
      // Save current state to undo stack
      const newUndoStack = [...state.undoStack, state];
      
      const { blockType } = action;
      const { selection } = state;
      const { startKey } = selection;
      
      const blockIndex = state.blocks.findIndex((block) => block.key === startKey);
      if (blockIndex === -1) return state;
      
      const block = state.blocks[blockIndex];
      
      // Toggle block type
      const newType = block.type === blockType ? 'paragraph' : blockType;
      
      const updatedBlocks = [...state.blocks];
      updatedBlocks[blockIndex] = {
        ...block,
        type: newType,
      };
      
      return {
        ...state,
        blocks: updatedBlocks,
        undoStack: newUndoStack,
        redoStack: [],
      };
    }
    
    case 'SET_SELECTION': {
      return {
        ...state,
        selection: action.selection,
      };
    }
    
    case 'INSERT_COMPONENT': {
      // Save current state to undo stack
      const newUndoStack = [...state.undoStack, state];
      
      const { component, id, position } = action;
      const { startKey, startOffset } = state.selection;
      
      const blockIndex = state.blocks.findIndex((block) => block.key === startKey);
      if (blockIndex === -1) return state;
      
      const block = state.blocks[blockIndex];
      
      // Insert component marker in text and add entity range
      const beforeText = block.text.substring(0, startOffset);
      const afterText = block.text.substring(startOffset);
      const updatedText = `${beforeText}⦿${afterText}`;
      
      const entityRanges = [
        ...block.entityRanges,
        {
          key: id,
          offset: startOffset,
          length: 1,
          type: 'COMPONENT',
        },
      ];
      
      const updatedBlocks = [...state.blocks];
      updatedBlocks[blockIndex] = {
        ...block,
        text: updatedText,
        entityRanges,
      };
      
      // Add component to the components map
      const updatedComponents = {
        ...state.components,
        [id]: {
          ...component,
          position: position || { x: 0, y: 0 },
        },
      };
      
      return {
        ...state,
        blocks: updatedBlocks,
        components: updatedComponents,
        undoStack: newUndoStack,
        redoStack: [],
      };
    }
    
    case 'INSERT_MENTION': {
      // Save current state to undo stack
      const newUndoStack = [...state.undoStack, state];
      
      const { mentionData } = action;
      const { startKey, startOffset } = state.selection;
      
      const blockIndex = state.blocks.findIndex((block) => block.key === startKey);
      if (blockIndex === -1) return state;
      
      const block = state.blocks[blockIndex];
      
      // Generate unique ID for the mention
      const mentionId = `mention-${Date.now()}`;
      
      // Insert mention marker in text and add entity range
      const beforeText = block.text.substring(0, startOffset);
      const afterText = block.text.substring(startOffset);
      const updatedText = `${beforeText}@${mentionData.name}${afterText}`;
      
      const entityRanges = [
        ...block.entityRanges,
        {
          key: mentionId,
          offset: startOffset,
          length: mentionData.name.length + 1, // +1 for the @ symbol
          type: 'MENTION',
        },
      ];
      
      const updatedBlocks = [...state.blocks];
      updatedBlocks[blockIndex] = {
        ...block,
        text: updatedText,
        entityRanges,
      };
      
      // Add mention to the mentions map
      const updatedMentions = {
        ...state.mentions,
        [mentionId]: mentionData,
      };
      
      return {
        ...state,
        blocks: updatedBlocks,
        mentions: updatedMentions,
        undoStack: newUndoStack,
        redoStack: [],
      };
    }
    
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      
      const previousState = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      const newRedoStack = [...state.redoStack, state];
      
      return {
        ...previousState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    }
    
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      
      const nextState = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      const newUndoStack = [...state.undoStack, state];
      
      return {
        ...nextState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    }
    
    default:
      return state;
  }
}

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  
  const executeCommand = useCallback((command: Command) => {
    // Execute command based on its type
    switch (command.type) {
      case 'toggleInlineStyle':
        dispatch({ type: 'TOGGLE_INLINE_STYLE', style: command.style });
        break;
      case 'toggleBlockType':
        dispatch({ type: 'TOGGLE_BLOCK_TYPE', blockType: command.blockType });
        break;
      case 'undo':
        dispatch({ type: 'UNDO' });
        break;
      case 'redo':
        dispatch({ type: 'REDO' });
        break;
      default:
        break;
    }
  }, []);
  
  const toggleInlineStyle = useCallback((style: InlineStyle) => {
    dispatch({ type: 'TOGGLE_INLINE_STYLE', style });
  }, []);
  
  const toggleBlockType = useCallback((blockType: BlockType) => {
    dispatch({ type: 'TOGGLE_BLOCK_TYPE', blockType });
  }, []);
  
  const updateSelection = useCallback((selection: SelectionState) => {
    dispatch({ type: 'SET_SELECTION', selection });
  }, []);
  
  const insertMention = useCallback((mentionData: MentionData) => {
    dispatch({ type: 'INSERT_MENTION', mentionData });
  }, []);
  
  return (
    <EditorContext.Provider 
      value={{
        state,
        dispatch,
        executeCommand,
        toggleInlineStyle,
        toggleBlockType,
        updateSelection,
        insertMention
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};