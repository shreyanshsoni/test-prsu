import React, { useState } from 'react';
import { Edit3, Check, X, Plus, Trash2, Copy } from 'lucide-react';
import { FieldEditor } from './FieldEditor';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'array';
  arrayType?: 'string' | 'object';
  objectFields?: Field[];
  options?: string[];
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
}

interface EditableSectionProps {
  title: string;
  description: string;
  icon: string;
  data: any;
  onUpdate: (data: any) => void;
  fields: Field[];
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  description,
  icon,
  data,
  onUpdate,
  fields
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const handleEdit = () => {
    setEditingData(data);
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingData(data);
    setIsEditing(false);
    setErrors({});
  };

  const validateField = (field: Field, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }
    
    if (field.validation) {
      return field.validation(value);
    }
    
    return null;
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = getNestedValue(editingData, field.key);
      const error = validateField(field, value);
      if (error) {
        newErrors[field.key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateAllFields()) {
      onUpdate(editingData);
      setIsEditing(false);
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  const updateField = (fieldKey: string, value: any) => {
    const newData = { ...editingData };
    setNestedValue(newData, fieldKey, value);
    setEditingData(newData);
    
    // Clear error for this field
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const renderDisplayValue = (field: Field, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>;
    }

    switch (field.type) {
      case 'array':
        if (field.arrayType === 'object') {
          return (
            <div className="space-y-2">
              {value.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {field.objectFields?.map(objField => (
                    <div key={objField.key} className="text-sm">
                      <span className="font-medium dark:text-gray-200">{objField.label}:</span> <span className="dark:text-gray-300">{item[objField.key] || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        } else {
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((item: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full">
                  {item}
                </span>
              ))}
            </div>
          );
        }
      case 'textarea':
        return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{value}</p>;
      default:
        return <span className="text-gray-700 dark:text-gray-300">{value}</span>;
    }
  };

  // Format individual field data for copying to clipboard
  const formatFieldForCopy = (field: Field, value: any) => {
    let result = `${field.label}:\n`;
    
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return `${field.label}: Not provided`;
    }
    
    if (field.type === 'array') {
      if (field.arrayType === 'object') {
        value.forEach((item: any, index: number) => {
          result += `  Item ${index + 1}:\n`;
          field.objectFields?.forEach(objField => {
            if (item[objField.key]) {
              result += `    ${objField.label}: ${item[objField.key]}\n`;
            }
          });
          result += '\n';
        });
      } else {
        result += `  ${value.join(', ')}`;
      }
    } else {
      result += `  ${value}`;
    }
    
    return result;
  };

  // Handle copy to clipboard for a specific field
  const handleCopyField = (fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;
    
    const value = getNestedValue(data, fieldKey);
    const formattedData = formatFieldForCopy(field, value);
    
    navigator.clipboard.writeText(formattedData).then(() => {
      setCopiedFields(prev => ({ ...prev, [fieldKey]: true }));
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [fieldKey]: false }));
      }, 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              aria-label={`Edit ${title}`}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {fields.map(field => (
            <div key={field.key}>
              <div className="flex items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                </label>
                
                {!isEditing && (
                  <button
                    onClick={() => handleCopyField(field.key)}
                    className="ml-2 p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={`Copy ${field.label}`}
                    aria-label={`Copy ${field.label}`}
                  >
                    {copiedFields[field.key] ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div>
                  <FieldEditor
                    field={field}
                    value={getNestedValue(editingData, field.key)}
                    onChange={(value) => updateField(field.key, value)}
                    error={errors[field.key]}
                  />
                  {errors[field.key] && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ) : (
                <div className="min-h-[2rem] flex items-start">
                  {renderDisplayValue(field, getNestedValue(data, field.key))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};