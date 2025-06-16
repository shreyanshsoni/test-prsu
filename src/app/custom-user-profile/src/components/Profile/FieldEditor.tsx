import React from 'react';
import { Plus, X } from 'lucide-react';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'array';
  arrayType?: 'string' | 'object';
  objectFields?: Field[];
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface FieldEditorProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, value, onChange, error }) => {
  const baseInputClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
  }`;

  const renderBasicField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClasses}
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  const renderArrayField = () => {
    const arrayValue = value || [];
    
    if (field.arrayType === 'string') {
      return (
        <div className="space-y-3">
          {arrayValue.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newArray = [...arrayValue];
                  newArray[index] = e.target.value;
                  onChange(newArray);
                }}
                placeholder={field.placeholder}
                className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => {
                  const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                  onChange(newArray);
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...arrayValue, ''])}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            type="button"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add {field.label}
          </button>
        </div>
      );
    } else if (field.arrayType === 'object' && field.objectFields) {
      return (
        <div className="space-y-4">
          {arrayValue.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">{field.label} #{index + 1}</h4>
                <button
                  onClick={() => {
                    const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                    onChange(newArray);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {field.objectFields.map(objField => (
                  <div key={objField.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {objField.label}
                    </label>
                    <FieldEditor
                      field={objField}
                      value={item[objField.key]}
                      onChange={(newValue) => {
                        const newArray = [...arrayValue];
                        newArray[index] = { ...newArray[index], [objField.key]: newValue };
                        onChange(newArray);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItem = field.objectFields?.reduce((acc, objField) => {
                acc[objField.key] = objField.type === 'array' ? [] : '';
                return acc;
              }, {} as any) || {};
              onChange([...arrayValue, newItem]);
            }}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            type="button"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add {field.label}
          </button>
        </div>
      );
    }
  };

  if (field.type === 'array') {
    return renderArrayField();
  }

  return renderBasicField();
};