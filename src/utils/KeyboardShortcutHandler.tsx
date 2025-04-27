import { useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { InlineStyle } from '../types/editor';

interface KeyboardShortcutHandlerProps {
  editorRef: React.RefObject<HTMLDivElement>;
}

const KeyboardShortcutHandler: React.FC<KeyboardShortcutHandlerProps> = ({ editorRef }) => {
  const { executeCommand } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            executeCommand({ type: 'toggleInlineStyle', style: 'BOLD' as InlineStyle });
            break;
          case 'i':
            e.preventDefault();
            executeCommand({ type: 'toggleInlineStyle', style: 'ITALIC' as InlineStyle });
            break;
          case 'u':
            e.preventDefault();
            executeCommand({ type: 'toggleInlineStyle', style: 'UNDERLINE' as InlineStyle });
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              executeCommand({ type: 'redo' });
            } else {
              executeCommand({ type: 'undo' });
            }
            break;
          default:
            break;
        }
      }

      if (e.key === '/') {
        console.log('Slash command detected');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [executeCommand, editorRef]);

  return null;
};

export default KeyboardShortcutHandler;