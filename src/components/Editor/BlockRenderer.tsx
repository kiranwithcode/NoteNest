import React from 'react';
import { Block, InlineStyleRange, EntityRange } from '../../types/editor';
import { useEditor } from '../../context/EditorContext';

interface BlockRendererProps {
  block: Block;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const { state } = useEditor();
  
  const renderStyledText = () => {
    let result = [];
    let lastOffset = 0;
    
    const allRanges = [
      ...block.inlineStyleRanges.map(range => ({ ...range, isStyle: true })),
      ...block.entityRanges.map(range => ({ ...range, isStyle: false }))
    ].sort((a, b) => a.offset - b.offset);
    
    for (let i = 0; i < allRanges.length; i++) {
      const range = allRanges[i];
      
      if (range.offset > lastOffset) {
        result.push(
          <span key={`text-${lastOffset}`}>
            {block.text.substring(lastOffset, range.offset)}
          </span>
        );
      }
      
      if (range.isStyle) {
        const styleRange = range as InlineStyleRange & { isStyle: boolean };
        const styledText = block.text.substring(range.offset, range.offset + range.length);
        result.push(renderStyledSpan(styledText, styleRange.style, range.offset));
      } else {
        const entityRange = range as EntityRange & { isStyle: boolean };
        const entityText = block.text.substring(range.offset, range.offset + range.length);
        result.push(renderEntitySpan(entityText, entityRange, range.offset));
      }
      
      lastOffset = range.offset + range.length;
    }
    
    if (lastOffset < block.text.length) {
      result.push(
        <span key={`text-${lastOffset}`}>
          {block.text.substring(lastOffset)}
        </span>
      );
    }
    
    return result.length > 0 ? result : block.text;
  };
  
  const renderStyledSpan = (text: string, style: string, offset: number) => {
    let className = "";
    let Element: React.ElementType = 'span';
    
    switch (style) {
      case 'BOLD':
        className = "font-bold";
        break;
      case 'ITALIC':
        className = "italic";
        break;
      case 'UNDERLINE':
        className = "underline";
        break;
      case 'STRIKETHROUGH':
        className = "line-through";
        break;
      case 'CODE':
        className = "font-mono bg-gray-100 px-1 rounded";
        break;
      case 'HIGHLIGHT':
        className = "bg-yellow-200";
        break;
      case 'SUBSCRIPT':
        Element = 'sub';
        break;
      case 'SUPERSCRIPT':
        Element = 'sup';
        break;
      default:
        break;
    }
    
    return (
      <Element key={`styled-${offset}`} className={className}>
        {text}
      </Element>
    );
  };
  
  const renderEntitySpan = (text: string, entityRange: EntityRange, offset: number) => {
    switch (entityRange.type) {
      case 'LINK':
        return (
          <a 
            key={`entity-${offset}`}
            href="#" 
            className="text-blue-600 underline"
          >
            {text}
          </a>
        );
      case 'COMPONENT':
        const component = state.components[entityRange.key];
        if (!component) return <span key={`entity-${offset}`}>{text}</span>;
        
        return (
          <span 
            key={`entity-${offset}`}
            className="inline-block bg-blue-100 text-blue-800 px-1 rounded cursor-pointer"
            data-component-id={entityRange.key}
          >
            {text} {/* This would be a component placeholder icon */}
          </span>
        );
      case 'MENTION':
        const mention = state.mentions[entityRange.key];
        if (!mention) return <span key={`entity-${offset}`}>{text}</span>;
        
        return (
          <span 
            key={`entity-${offset}`}
            className="inline-block bg-blue-100 text-blue-800 px-1 rounded cursor-pointer"
            data-mention-id={entityRange.key}
          >
            {text}
          </span>
        );
      default:
        return <span key={`entity-${offset}`}>{text}</span>;
    }
  };
  
  const getBlockElement = () => {
    switch (block.type) {
      case 'header-one':
        return <h1 className="text-3xl font-bold mb-4" data-block data-block-key={block.key}>{renderStyledText()}</h1>;
      case 'header-two':
        return <h2 className="text-2xl font-bold mb-3" data-block data-block-key={block.key}>{renderStyledText()}</h2>;
      case 'header-three':
        return <h3 className="text-xl font-bold mb-2" data-block data-block-key={block.key}>{renderStyledText()}</h3>;
      case 'unordered-list-item':
        return (
          <ul className="list-disc pl-6 mb-4" style={{ marginLeft: `${block.depth * 1.5}rem` }}>
            <li data-block data-block-key={block.key}>{renderStyledText()}</li>
          </ul>
        );
      case 'ordered-list-item':
        return (
          <ol className="list-decimal pl-6 mb-4" style={{ marginLeft: `${block.depth * 1.5}rem` }}>
            <li data-block data-block-key={block.key}>{renderStyledText()}</li>
          </ol>
        );
      case 'blockquote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" data-block data-block-key={block.key}>
            {renderStyledText()}
          </blockquote>
        );
      case 'code-block':
        return (
          <pre className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto my-4" data-block data-block-key={block.key}>
            <code>{renderStyledText()}</code>
          </pre>
        );
      case 'callout':
        return (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r" data-block data-block-key={block.key}>
            {renderStyledText()}
          </div>
        );
      case 'paragraph':
      default:
        return <p className="mb-4" data-block data-block-key={block.key}>{renderStyledText()}</p>;
    }
  };
  
  return getBlockElement();
};

export default BlockRenderer;