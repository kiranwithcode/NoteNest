import React, { useState } from 'react';
import { ComponentData } from '../../types/editor';
import { X } from 'lucide-react';

interface ComponentPopoverProps {
  component: ComponentData;
  position: { top: number; left: number };
  onUpdate: (id: string, data: Partial<ComponentData>) => void;
  onClose: () => void;
}

const ComponentPopover: React.FC<ComponentPopoverProps> = ({ 
  component, 
  position, 
  onUpdate, 
  onClose 
}) => {
  const [values, setValues] = useState<Record<string, any>>(component.data || {});
  
  const handleChange = (key: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSave = () => {
    onUpdate(component?.id || '', {
      data: values
    });
    onClose();
  };
  
  const renderForm = () => {
    switch (component.type) {
      case 'image':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="src" className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                id="src"
                value={values.src || ''}
                onChange={(e) => handleChange('src', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="alt" className="block text-sm font-medium text-gray-700">Alt Text</label>
              <input
                type="text"
                id="alt"
                value={values.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        );
        
      case 'link':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                id="url"
                value={values.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">Text</label>
              <input
                type="text"
                id="text"
                value={values.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        );
        
      default:
        return (
          <div className="mb-3">
            <p className="text-sm text-gray-500">No editable properties for this component type.</p>
          </div>
        );
    }
  };
  
  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md z-30 w-80 border border-gray-200"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`
      }}
      role="dialog"
      aria-label={`Edit ${component.type}`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-medium capitalize">{component.type}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4">
        {renderForm()}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentPopover;