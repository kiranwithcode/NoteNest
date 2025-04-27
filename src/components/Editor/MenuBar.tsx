import React, { useState } from 'react';
import { 
  Save, FileText, Copy, Scissors, ClipboardCopy, Eye, 
   Table as TableIcon, Image, Link, ListPlus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Undo, Redo
} from 'lucide-react';

interface MenuBarProps {
  execCommand: (command: string, value?: string | boolean) => void;
}

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  submenu?: MenuItem[];
  shortcut?: string;
  type?:any;
}

const MenuBar: React.FC<MenuBarProps> = ({ execCommand }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleSave = () => {
    const content = document.querySelector('[contenteditable]')?.innerHTML;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const menus: Record<string, MenuItem[]> = {
    'File': [
      { 
        label: 'New Document', 
        icon: <FileText size={16} />,
        action: () => {
          if (confirm('Clear document? This cannot be undone.')) {
            document.execCommand('selectAll');
            document.execCommand('delete');
          }
        },
        shortcut: 'Ctrl+N'
      },
      { 
        label: 'Save', 
        icon: <Save size={16} />,
        action: handleSave,
        shortcut: 'Ctrl+S'
      },
    ],
    'Edit': [
      {
        label: 'Undo',
        icon: <Undo size={16} />,
        action: () => document.execCommand('undo'),
        shortcut: 'Ctrl+Z'
      },
      {
        label: 'Redo',
        icon: <Redo size={16} />,
        action: () => document.execCommand('redo'),
        shortcut: 'Ctrl+Y'
      },
      // { type: 'separator' },
      { 
        label: 'Cut',
        icon: <Scissors size={16} />,
        action: () => document.execCommand('cut'),
        shortcut: 'Ctrl+X'
      },
      { 
        label: 'Copy',
        icon: <Copy size={16} />,
        action: () => document.execCommand('copy'),
        shortcut: 'Ctrl+C'
      },
      { 
        label: 'Paste',
        icon: <ClipboardCopy size={16} />,
        action: () => document.execCommand('paste'),
        shortcut: 'Ctrl+V'
      },
    ],
    'View': [
      { 
        label: 'Preview Mode',
        icon: <Eye size={16} />,
        action: () => console.log('Preview clicked')
      },
    ],
    'Insert': [
      {
        label: 'Image',
        icon: <Image size={16} />,
        action: () => {
          const url = prompt('Enter image URL:');
          if (url) execCommand('insertImage', url);
        }
      },
      {
        label: 'Link',
        icon: <Link size={16} />,
        action: () => {
          const url = prompt('Enter URL:');
          if (url) execCommand('createLink', url);
        },
        shortcut: 'Ctrl+K'
      },
      {
        label: 'List',
        icon: <ListPlus size={16} />,
        submenu: [
          {
            label: 'Bullet List',
            action: () => execCommand('insertUnorderedList')
          },
          {
            label: 'Numbered List',
            action: () => execCommand('insertOrderedList')
          }
        ]
      }
    ],
    'Format': [
      {
        label: 'Text Style',
        submenu: [
          {
            label: 'Bold',
            icon: <Bold size={16} />,
            action: () => execCommand('bold'),
            shortcut: 'Ctrl+B'
          },
          {
            label: 'Italic',
            icon: <Italic size={16} />,
            action: () => execCommand('italic'),
            shortcut: 'Ctrl+I'
          },
          {
            label: 'Underline',
            icon: <Underline size={16} />,
            action: () => execCommand('underline'),
            shortcut: 'Ctrl+U'
          },
          {
            label: 'Strikethrough',
            icon: <Strikethrough size={16} />,
            action: () => execCommand('strikethrough')
          }
        ]
      },
      {
        label: 'Alignment',
        submenu: [
          {
            label: 'Left',
            icon: <AlignLeft size={16} />,
            action: () => execCommand('justifyLeft')
          },
          {
            label: 'Center',
            icon: <AlignCenter size={16} />,
            action: () => execCommand('justifyCenter')
          },
          {
            label: 'Right',
            icon: <AlignRight size={16} />,
            action: () => execCommand('justifyRight')
          },
          {
            label: 'Justify',
            icon: <AlignJustify size={16} />,
            action: () => execCommand('justifyFull')
          }
        ]
      },
      {
        label: 'Clear Formatting',
        action: () => execCommand('removeFormat')
      }
    ],
    'Table': [
      {
        label: 'Insert Table',
        icon: <TableIcon size={16} />,
        action: () => {
          const rows = prompt('Number of rows:', '3');
          const cols = prompt('Number of columns:', '3');
          if (rows && cols) {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.border = '1px solid #ccc';
            
            for (let i = 0; i < parseInt(rows); i++) {
              const row = table.insertRow();
              for (let j = 0; j < parseInt(cols); j++) {
                const cell = row.insertCell();
                cell.style.border = '1px solid #ccc';
                cell.style.padding = '8px';
                cell.innerHTML = '&nbsp;';
              }
            }
            
            execCommand('insertHTML', table.outerHTML);
          }
        }
      },
      // {
      //   label: 'Delete Table',
      //   action: () => {
      //     const selection = window.getSelection();
      //     if (selection) {
      //       const range = selection.getRangeAt(0);
      //       const table = range.commonAncestorContainer?.closest('table');
      //       if (table) table.remove();
      //     }
      //   }
      // }
    ]
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.submenu) return;
    if (item.action) {
      item.action();
    }
    setActiveMenu(null);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex items-center px-2">
        {Object.entries(menus).map(([menuName, items]) => (
          <div key={menuName} className="relative">
            <button
              className={`px-3 py-2 text-sm hover:bg-gray-200 ${
                activeMenu === menuName ? 'bg-white border-t border-x border-gray-200' : ''
              }`}
              onClick={() => handleMenuClick(menuName)}
            >
              {menuName}
            </button>
            {activeMenu === menuName && (
              <div className="absolute left-0 top-full z-50 w-48 bg-white border border-gray-200 shadow-lg py-1 rounded-b-md">
                {items.map((item, index) => (
                  <div key={index}>
                    {item.type === 'separator' ? (
                      <hr className="my-1 border-gray-200" />
                    ) : (
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 group"
                        onClick={() => handleMenuItemClick(item)}
                      >
                        <span className="w-5">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.shortcut && (
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">
                            {item.shortcut}
                          </span>
                        )}
                        {item.submenu && <span className="text-gray-400">▶</span>}
                      </button>
                    )}
                    {item.submenu && activeMenu === menuName && (
                      <div className="absolute left-full top-0 w-48 bg-white border border-gray-200 shadow-lg py-1 rounded-md -mt-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 group"
                            onClick={() => handleMenuItemClick(subItem)}
                          >
                            <span className="w-5">{subItem.icon}</span>
                            <span className="flex-1">{subItem.label}</span>
                            {subItem.shortcut && (
                              <span className="text-xs text-gray-400 group-hover:text-gray-600">
                                {subItem.shortcut}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;