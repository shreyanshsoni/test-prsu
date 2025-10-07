import React, { useState, useRef } from 'react';
import { Camera, User, Mail, Edit3, Check, X, LockIcon } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface PersonalInfo {
  name: string;
  email: string;
  profilePicture: string | null;
}

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  onUpdate: (info: PersonalInfo) => void;
  readOnly?: boolean;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personalInfo,
  onUpdate,
  readOnly = false
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editingInfo, setEditingInfo] = useState(personalInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEdit = () => {
    if (readOnly) {
      return;
    }
    setEditingInfo(personalInfo);
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingInfo(personalInfo);
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!editingInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(editingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpdate(editingInfo);
      setIsEditing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server and get back a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setEditingInfo(prev => ({ ...prev, profilePicture: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setEditingInfo(prev => ({ ...prev, profilePicture: null }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Personal Information</h2>
        {readOnly ? (
          <div className="flex items-center text-amber-600 dark:text-amber-500">
            <LockIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">Log in to edit</span>
          </div>
        ) : !isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
              {(isEditing ? editingInfo.profilePicture : personalInfo.profilePicture) ? (
                <img
                  src={isEditing ? editingInfo.profilePicture! : personalInfo.profilePicture!}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-12 h-12 text-white ${(isEditing ? editingInfo.profilePicture : personalInfo.profilePicture) ? 'hidden' : ''}`} />
            </div>
            
            {isEditing && !readOnly && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                  title="Upload new photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {editingInfo.profilePicture && (
                  <button
                    onClick={removeProfilePicture}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {isEditing && !readOnly && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Click camera to upload<br />
              JPG, PNG up to 5MB
            </p>
          )}
        </div>

        {/* Personal Details */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name {!readOnly && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>
            {isEditing && !readOnly ? (
              <div>
                <input
                  type="text"
                  value={editingInfo.name}
                  onChange={(e) => setEditingInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{personalInfo.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address {!readOnly && <span className="text-red-500 dark:text-red-400">*</span>}
            </label>
            {isEditing && !readOnly ? (
              <div>
                <input
                  type="email"
                  value={editingInfo.email}
                  onChange={(e) => setEditingInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{personalInfo.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};