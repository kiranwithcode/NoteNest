
# Multi-modal Content Writing Tool

A specialized content writing tool that combines text editing with interactive elements. This editor supports rich text formatting, nested lists, custom block elements, inline components, advanced keyboard shortcuts, and a robust clipboard system.

Deployed Link: https://note-nest-coral.vercel.app/
<!-- ![Editor Screenshot](https://via.placeholder.com/800x450.png?text=Multi-modal+Content+Editor) -->

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [State Management](#state-management)
- [Accessibility](#accessibility)
- [Performance Considerations](#performance-considerations)
- [Edge Cases](#edge-cases)
- [Getting Started](#getting-started)
- [Usage](#usage)

## Features

### Core Functionality

- **Rich Text Editor**
  - Text formatting (bold, italic, underline, headings)
  - Nested lists with custom indentation behavior
  - Custom block elements (quotes, code blocks, callouts)

- **Inline Component System**
  - Insert interactive elements within text content
  - Edit properties of elements without disrupting surrounding text
  - Drag and reposition elements while maintaining text flow

- **Advanced Keyboard Shortcuts**
  - Combination key support (e.g., Cmd+Shift+8)
  - Custom key sequences (e.g., "/" followed by command text)
  - Keyboard navigation between interactive elements

- **Robust Clipboard System**
  - Preservation of formatting when pasting from external sources
  - Format conversion between different content types
  - Custom paste behaviors for different content zones

### Advanced Features

- **Custom Undo/Redo System**
  - Groups related operations into a single undoable action
  - Preserves selection state across undo/redo operations
  - Handles complex content transformations

- **@mention System**
  - Fuzzy search across multiple data sources
  - Preview cards for mentioned entities
  - Keyboard navigation for mention selection

## Architecture

### Component Structure

The editor is built with a modular architecture to ensure maintainability and separation of concerns:

```
src/
├── components/
│   ├── Editor/
│   │   ├── Editor.tsx           # Main editor component
│   │   ├── EditorContent.tsx    # Content rendering
│   │   ├── BlockRenderer.tsx    # Block-level rendering
│   │   ├── MenuBar.tsx          # Top menu bar
│   │   └── Toolbar.tsx          # Formatting toolbar
│   ├── InlineComponent/
│   │   └── ComponentPopover.tsx # Inline component editor
│   └── Mention/
│       └── MentionPopover.tsx   # @mention selection interface
├── context/
│   └── EditorContext.tsx        # Central state management
├── types/
│   └── editor.ts                # TypeScript type definitions
└── utils/
    ├── KeyboardShortcutHandler.tsx # Keyboard interaction
    └── SelectionUtils.ts           # Selection management
```

### Design Decisions

1. **Custom Editor Implementation**
   - Built from scratch without relying on existing WYSIWYG libraries
   - Uses contentEditable with controlled rendering for maximum flexibility
   - Custom selection and range management for precise control

2. **Component-Based Architecture**
   - Each editor feature is encapsulated in its own component
   - Clear separation between rendering, state management, and utilities
   - Modular design allows for easy extension and maintenance

3. **Content Model**
   - Document represented as an array of blocks
   - Each block has a type, content, and formatting metadata
   - Inline components are stored separately and referenced in text content
   - This approach allows for complex formatting while maintaining clean serialization

4. **Rendering Strategy**
   - Two-phase rendering: first convert state to virtual DOM, then render to contentEditable
   - Custom reconciliation to maintain selection and focus during updates
   - Separate rendering paths for editing and preview modes

## State Management

### EditorContext

The editor uses a custom context provider with reducers for centralized state management:

```typescript
// Core state structure
interface EditorState {
  blocks: Block[];
  inlineComponents: InlineComponent[];
  selection: Selection;
  activeFormats: TextFormat[];
}

// History state for undo/redo
interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}