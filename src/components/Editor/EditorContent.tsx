import React, { useCallback, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Block } from '../../types/editor';
import BlockRenderer from './BlockRenderer';

const EditorContent: React.FC = () => {
  const { state } = useEditor();
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    // For now, we'll keep it simple
  }, []);

  const handleBeforeInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    // const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');
    
    document.execCommand('insertText', false, textData);
    
  }, []);

  return (
    <div
      ref={contentEditableRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleContentChange}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      className="min-h-[200px] outline-none"
      aria-label="Text editor content"
      role="textbox"
      aria-multiline="true"
    >
      {state.blocks.map((block: Block) => (
        <BlockRenderer 
          key={block.key} 
          block={block}
        />
      ))}
    </div>
  );
};

export default EditorContent;