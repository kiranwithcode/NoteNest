import React, { useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, List, ListOrdered, Quote, Code,
  Palette, ChevronDown, Undo, Redo
} from 'lucide-react';

interface ToolbarProps {
  execCommand: (command: string, value?: string | boolean) => void;
  selection: Selection | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ execCommand }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedSize, setSelectedSize] = useState('3');

  const colors = {
    'Theme Colors': [
      ['#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#4472C4', '#2F5597', '#1F3864', '#70AD47'],
      ['#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#71B8FF', '#C1E3FF', '#DEEBF7', '#E2F0D9'],
    ],
    'Standard Colors': [
      ['#C00000', '#FF0000', '#FFC000', '#FFE699', '#92D050', '#00B050', '#00B0F0', '#0070C0'],
      ['#002060', '#7030A0', '#D60093', '#FF99CC', '#FF9999', '#FFCC99', '#FFFF99', '#99FF99'],
    ],
  };

  const fonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Georgia', 
    'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS'
  ];

  const fontSizes = [
    { value: '1', display: '8pt' },
    { value: '2', display: '10pt' },
    { value: '3', display: '12pt' },
    { value: '4', display: '14pt' },
    { value: '5', display: '18pt' },
    { value: '6', display: '24pt' },
    { value: '7', display: '36pt' },
  ];

  useEffect(() => {
    const checkActiveStyles = () => {
      const newActiveStyles = new Set<string>();
      
      if (document.queryCommandState('bold')) newActiveStyles.add('bold');
      if (document.queryCommandState('italic')) newActiveStyles.add('italic');
      if (document.queryCommandState('underline')) newActiveStyles.add('underline');
      if (document.queryCommandState('strikethrough')) newActiveStyles.add('strikethrough');
      if (document.queryCommandState('subscript')) newActiveStyles.add('subscript');
      if (document.queryCommandState('superscript')) newActiveStyles.add('superscript');
      if (document.queryCommandState('justifyLeft')) newActiveStyles.add('justifyLeft');
      if (document.queryCommandState('justifyCenter')) newActiveStyles.add('justifyCenter');
      if (document.queryCommandState('justifyRight')) newActiveStyles.add('justifyRight');
      if (document.queryCommandState('justifyFull')) newActiveStyles.add('justifyFull');
      
      const formatBlock = document.queryCommandValue('formatBlock');
      if (formatBlock) {
        newActiveStyles.add(formatBlock.toLowerCase());
      }
      
      setActiveStyles(newActiveStyles);
    };

    document.addEventListener('selectionchange', checkActiveStyles);
    return () => document.removeEventListener('selectionchange', checkActiveStyles);
  }, []);

  const handleCommand = (command: string, value?: string) => {
    execCommand(command, value);
    const newActiveStyles = new Set(activeStyles);
    if (newActiveStyles.has(command)) {
      newActiveStyles.delete(command);
    } else {
      newActiveStyles.add(command);
    }
    setActiveStyles(newActiveStyles);
  };

  const formatBlock = (tag: string) => {
    const isActive = activeStyles.has(tag.toLowerCase());
    if (isActive) {
      execCommand('formatBlock', 'p');
      const newActiveStyles = new Set(activeStyles);
      newActiveStyles.delete(tag.toLowerCase());
      setActiveStyles(newActiveStyles);
    } else {
      execCommand('formatBlock', tag);
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap" role="toolbar">
      <div className="flex items-center gap-1">
        <button
          onClick={() => execCommand('undo')}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => execCommand('redo')}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Redo"
        >
          <Redo size={16} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="px-3 py-1.5 hover:bg-gray-100 rounded flex items-center gap-2 min-w-[120px]"
            aria-label="Font Family"
          >
            <span className="text-sm truncate" style={{ fontFamily: selectedFont }}>{selectedFont}</span>
            <ChevronDown size={14} />
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 p-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-48">
              {fonts.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    execCommand('fontName', font);
                    setSelectedFont(font);
                    setShowFontPicker(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFontSize(!showFontSize)}
            className="px-3 py-1.5 hover:bg-gray-100 rounded flex items-center gap-2 min-w-[60px]"
            aria-label="Font Size"
          >
            <span className="text-sm">{fontSizes.find(f => f.value === selectedSize)?.display || '12pt'}</span>
            <ChevronDown size={14} />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 p-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-24">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => {
                    execCommand('fontSize', size.value);
                    setSelectedSize(size.value);
                    setShowFontSize(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                >
                  {size.display}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => handleCommand('bold')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('bold') ? 'bg-gray-200' : ''}`}
        aria-label="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => handleCommand('italic')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('italic') ? 'bg-gray-200' : ''}`}
        aria-label="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => handleCommand('underline')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('underline') ? 'bg-gray-200' : ''}`}
        aria-label="Underline"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => handleCommand('strikethrough')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('strikethrough') ? 'bg-gray-200' : ''}`}
        aria-label="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => handleCommand('subscript')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('subscript') ? 'bg-gray-200' : ''}`}
        aria-label="Subscript"
      >
        <Subscript size={16} />
      </button>
      <button
        onClick={() => handleCommand('superscript')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('superscript') ? 'bg-gray-200' : ''}`}
        aria-label="Superscript"
      >
        <Superscript size={16} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 hover:bg-gray-100 rounded flex items-center gap-1"
          aria-label="Text Color"
        >
          <div className="w-4 h-4 border border-gray-300" style={{ backgroundColor: selectedColor }} />
          <Palette size={16} />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded shadow-lg z-50 w-64">
            {Object.entries(colors).map(([category, colorRows]) => (
              <div key={category} className="mb-3">
                <div className="text-xs text-gray-600 mb-1">{category}</div>
                {colorRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 mb-1">
                    {row.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          execCommand('foreColor', color);
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => handleCommand('justifyLeft')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('justifyLeft') ? 'bg-gray-200' : ''}`}
        aria-label="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => handleCommand('justifyCenter')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('justifyCenter') ? 'bg-gray-200' : ''}`}
        aria-label="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => handleCommand('justifyRight')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('justifyRight') ? 'bg-gray-200' : ''}`}
        aria-label="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        onClick={() => handleCommand('justifyFull')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('justifyFull') ? 'bg-gray-200' : ''}`}
        aria-label="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => formatBlock('h1')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('h1') ? 'bg-gray-200' : ''}`}
        aria-label="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => formatBlock('h2')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('h2') ? 'bg-gray-200' : ''}`}
        aria-label="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => execCommand('insertUnorderedList')}
        className="p-2 hover:bg-gray-100 rounded"
        aria-label="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => execCommand('insertOrderedList')}
        className="p-2 hover:bg-gray-100 rounded"
        aria-label="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        onClick={() => formatBlock('blockquote')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('blockquote') ? 'bg-gray-200' : ''}`}
        aria-label="Quote"
      >
        <Quote size={16} />
      </button>
      <button
        onClick={() => formatBlock('pre')}
        className={`p-2 hover:bg-gray-100 rounded ${activeStyles.has('pre') ? 'bg-gray-200' : ''}`}
        aria-label="Code Block"
      >
        <Code size={16} />
      </button>
    </div>
  );
};

export default Toolbar;