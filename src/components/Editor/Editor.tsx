import React, { useRef, useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import MenuBar from './MenuBar';
// import { useEditor } from '../../context/EditorContext';
import KeyboardShortcutHandler from '../../utils/KeyboardShortcutHandler';
import MentionPopover from '../Mention/MentionPopover';
import ComponentPopover from '../InlineComponent/ComponentPopover';

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [showComponentPopover, setShowComponentPopover] = useState(false);
  const [componentPosition, setComponentPosition] = useState({ top: 0, left: 0 });
  // const { state, dispatch } = useEditor();

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && editorRef.current?.contains(sel.anchorNode)) {
        setSelection(sel);
        handleMentionTrigger(sel);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const execCommand = (command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value as any);
    editorRef.current?.focus();
    updateWordCount();
  };

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      setWordCount({ words, characters });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
      if (rect) {
        setComponentPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
        setShowComponentPopover(true);
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection) {
        const node = selection.anchorNode?.parentElement;
        if (node?.closest('li')) {
          if (e.shiftKey) {
            execCommand('outdent');
          } else {
            execCommand('indent');
          }
          return;
        }
      }
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    updateWordCount();
  };

  const handleMentionTrigger = (selection: Selection) => {
    const text = selection.anchorNode?.textContent || '';
    const position = selection.anchorOffset;
    const lastAtSymbol = text.lastIndexOf('@', position);
    
    if (lastAtSymbol >= 0 && position - lastAtSymbol <= 20) {
      const query = text.slice(lastAtSymbol + 1, position);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setMentionQuery(query);
      setMentionPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const clean = sanitizeHTML(doc.body);
      
      execCommand('insertHTML', clean.innerHTML);
    } else {
      execCommand('insertText', text);
    }
  };

  const sanitizeHTML = (node: HTMLElement): HTMLElement => {
    const clone = node.cloneNode(true) as HTMLElement;
    
    const scripts = clone.getElementsByTagName('script');
    while (scripts.length > 0) {
      scripts[0].parentNode?.removeChild(scripts[0]);
    }
    
    const elements = clone.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const attrs = el.attributes;
      for (let j = attrs.length - 1; j >= 0; j--) {
        const attr = attrs[j];
        if (attr.name.startsWith('on') || attr.name === 'style') {
          el.removeAttribute(attr.name);
        }
      }
    }
    
    return clone;
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <MenuBar execCommand={execCommand} />
      <Toolbar execCommand={execCommand} selection={selection} />
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none prose prose-lg max-w-none"
        onKeyDown={handleKeyDown}
        onInput={updateWordCount}
        onPaste={handlePaste}
        suppressContentEditableWarning
      >
        {/* <p>Start writing here...</p> */}
      </div>
      <div className="border-t border-gray-200 px-4 py-2 text-sm text-gray-500">
        Words: {wordCount.words} | Characters: {wordCount.characters}
      </div>
      
      {showMentionPopover && (
        <MentionPopover
          query={mentionQuery}
          position={mentionPosition}
          onClose={() => setShowMentionPopover(false)}
        />
      )}
      
      {showComponentPopover && (
        <ComponentPopover
        component={{ type: 'default', data: {}, position: { x: 0, y: 0 }}}
        position={componentPosition}
          onUpdate={() => {}}
          onClose={() => setShowComponentPopover(false)}
        />
      )}
      
      <KeyboardShortcutHandler editorRef={editorRef} />
    </div>
  );
};

export default Editor;