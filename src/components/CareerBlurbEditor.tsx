import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../app/contexts/ThemeContext';
import { Edit2, Check, X } from 'lucide-react';

interface CareerBlurbEditorProps {
  careerBlurb: string;
  onUpdate: (blurb: string) => Promise<boolean>;
}

export default function CareerBlurbEditor({ careerBlurb, onUpdate }: CareerBlurbEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [blurb, setBlurb] = useState(careerBlurb || '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onUpdate(blurb);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving career blurb:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBlurb(careerBlurb || '');
    setIsEditing(false);
  };

  return (
    <div className={`${isDark ? 'bg-dark-card' : 'bg-white'} rounded-xl shadow-sm p-6 mb-6`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-800'}`}>
          Career Blurb
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className={`p-2 rounded-full ${
              isDark ? 'hover:bg-dark-hover text-dark-muted' : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Edit career blurb"
          >
            <Edit2 size={16} />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className={`p-2 rounded-full ${
                isDark ? 'hover:bg-dark-hover text-dark-muted' : 'hover:bg-gray-100 text-gray-600'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Cancel editing"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-full ${
                isDark ? 'hover:bg-dark-hover text-green-400' : 'hover:bg-gray-100 text-green-600'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Save career blurb"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-green-500 rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="Enter your career vision here..."
          className={`w-full p-3 min-h-[100px] rounded-lg border ${
            isDark
              ? 'bg-dark-background border-dark-border text-dark-text'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          disabled={isSaving}
        />
      ) : (
        <div
          className={`${
            isDark ? 'text-dark-text' : 'text-gray-700'
          } italic ${!blurb ? 'text-opacity-70' : ''}`}
        >
          {blurb ? `"${blurb}"` : 'No career blurb set. Click the edit button to add one.'}
        </div>
      )}


    </div>
  );
}
