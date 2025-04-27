import { SelectionState } from '../types/editor';

export const getCurrentSelection = (): SelectionState | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  
  const startBlock = findBlockElement(range.startContainer);
  const endBlock = findBlockElement(range.endContainer);
  
  if (!startBlock || !endBlock) return null;
  
  const startKey = startBlock.getAttribute('data-block-key') || '';
  const endKey = endBlock.getAttribute('data-block-key') || '';
  
  if (!startKey || !endKey) return null;
  
  return {
    startKey,
    endKey,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    hasFocus: true,
  };
};

export const setDOMSelection = (selectionState: SelectionState): boolean => {
  const { startKey, endKey, startOffset, endOffset } = selectionState;
  
  const startBlock = document.querySelector(`[data-block-key="${startKey}"]`);
  const endBlock = document.querySelector(`[data-block-key="${endKey}"]`);
  
  if (!startBlock || !endBlock) return false;
  
  const startNode = findTextNode(startBlock, startOffset);
  const endNode = findTextNode(endBlock, endOffset);
  
  if (!startNode || !endNode) return false;
  
  const selection = window.getSelection();
  if (!selection) return false;
  
  const range = document.createRange();
  range.setStart(startNode.node, startNode.offset);
  range.setEnd(endNode.node, endNode.offset);
  
  selection.removeAllRanges();
  selection.addRange(range);
  
  return true;
};

export const findBlockElement = (node: Node | null): HTMLElement | null => {
  if (!node) return null;
  
  if (node.nodeType === Node.TEXT_NODE) {
    return findBlockElement(node.parentElement);
  }
  
  const element = node as HTMLElement;
  if (element.getAttribute && element.getAttribute('data-block')) {
    return element;
  }
  
  if (element.closest) {
    return element.closest('[data-block]');
  }
  
  return null;
};

const findTextNode = (blockElement: Element, offset: number): { node: Node; offset: number } | null => {
  const textNodes: Node[] = [];
  
  const collectTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        collectTextNodes(node.childNodes[i]);
      }
    }
  };
  
  collectTextNodes(blockElement);
  
  if (textNodes.length === 0) return null;
  
  let currentOffset = 0;
  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent?.length || 0;
    
    if (currentOffset + nodeLength >= offset) {
      return {
        node: textNode,
        offset: offset - currentOffset,
      };
    }
    
    currentOffset += nodeLength;
  }
  
  const lastNode = textNodes[textNodes.length - 1];
  return {
    node: lastNode,
    offset: lastNode.textContent?.length || 0,
  };
};