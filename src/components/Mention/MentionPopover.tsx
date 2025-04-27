import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { MentionData } from '../../types/editor';
import { User, Hash, AtSign } from 'lucide-react';

interface MentionPopoverProps {
  query: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const MentionPopover: React.FC<MentionPopoverProps> = ({ query, position, onClose }) => {
  const { insertMention } = useEditor();
  const [filteredOptions, setFilteredOptions] = useState<MentionData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const mockUsers: MentionData[] = [
    { id: 'user1', name: 'Alex Johnson', type: 'user', avatarUrl: 'https://i.pravatar.cc/150?u=a1' },
    { id: 'user2', name: 'Samantha Lee', type: 'user', avatarUrl: 'https://i.pravatar.cc/150?u=a2' },
    { id: 'user3', name: 'Michael Chen', type: 'user', avatarUrl: 'https://i.pravatar.cc/150?u=a3' },
    { id: 'topic1', name: 'Design Systems', type: 'topic' },
    { id: 'topic2', name: 'Frontend', type: 'topic' },
    { id: 'team1', name: 'Engineering', type: 'team' },
    { id: 'team2', name: 'Product', type: 'team' },
  ];
  
  useEffect(() => {
    const filtered = mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOptions(filtered);
    setActiveIndex(0);
  }, [query]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % filteredOptions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions.length > 0) {
            handleSelectMention(filteredOptions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredOptions, activeIndex, onClose]);
  
  const handleSelectMention = (mention: MentionData) => {
    insertMention(mention);
    onClose();
  };
  
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User size={16} className="text-blue-500" />;
      case 'topic':
        return <Hash size={16} className="text-emerald-500" />;
      case 'team':
        return <AtSign size={16} className="text-amber-500" />;
      default:
        return <AtSign size={16} />;
    }
  };

  if (filteredOptions.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md z-20 overflow-hidden w-64 max-h-64 border border-gray-200"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`
      }}
      role="listbox"
      aria-label="Mention suggestions"
    >
      <div className="py-1">
        {filteredOptions.map((option, index) => (
          <div
            key={option.id}
            className={`flex items-center px-3 py-2 cursor-pointer ${index === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => handleSelectMention(option)}
            role="option"
            aria-selected={index === activeIndex}
          >
            <div className="flex-shrink-0 mr-3">
              {option.avatarUrl ? (
                <img src={option.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                renderTypeIcon(option.type)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{option.name}</p>
              <p className="text-xs text-gray-500 capitalize">{option.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentionPopover;