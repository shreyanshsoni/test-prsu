import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Mail, Edit3, Check, X, LockIcon } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface PersonalInfo {
  name: string;
  email: string;
  profilePicture: string | null;
  firstName?: string;
  lastName?: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayName, setDisplayName] = useState(personalInfo.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync personalInfo prop with local state when it changes
  useEffect(() => {
    if (!isEditing) {
      setEditingInfo(personalInfo);
      setDisplayName(personalInfo.name);
    }
  }, [personalInfo, isEditing]);

  const handleEdit = () => {
    if (readOnly) {
      return;
    }
    
    // Split the full name into first and last name
    const nameParts = personalInfo.name.trim().split(/\s+/).filter(part => part.length > 0);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setEditingInfo({
      ...personalInfo,
      firstName,
      lastName
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingInfo(personalInfo);
    setIsEditing(false);
    setErrors({});
    setIsSaving(false);
    setIsRefreshing(false);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!editingInfo.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!editingInfo.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true);
      try {
        // Save to database
        const response = await fetch('/api/update-user-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: editingInfo.firstName?.trim(),
            lastName: editingInfo.lastName?.trim(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Create the new full name from the API response
          const newFullName = `${data.first_name} ${data.last_name}`;
          
          // Update the local state with the saved data
          const updatedInfo = {
            ...editingInfo,
            name: newFullName,
            firstName: data.first_name,
            lastName: data.last_name
          };
          
          // Update parent component
          onUpdate(updatedInfo);
          
          // Refresh the entire profile by calling the API again
          setIsRefreshing(true);
          try {
            const refreshResponse = await fetch('/api/user-profile', {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const profile = refreshData.profile;
              
              if (profile && profile.first_name && profile.last_name) {
                const refreshedFullName = `${profile.first_name} ${profile.last_name}`;
                
                // Update with fresh data from API
                const refreshedInfo = {
                  ...updatedInfo,
                  name: refreshedFullName,
                  firstName: profile.first_name,
                  lastName: profile.last_name
                };
                
                // Update parent with fresh data
                onUpdate(refreshedInfo);
                
                // Update local display name
                setDisplayName(refreshedFullName);
              } else {
                // Fallback to the saved data if refresh fails
                setDisplayName(newFullName);
              }
            } else {
              // Fallback to the saved data if refresh fails
              setDisplayName(newFullName);
            }
          } catch (refreshError) {
            console.error('Error refreshing profile:', refreshError);
            // Fallback to the saved data if refresh fails
            setDisplayName(newFullName);
          } finally {
            setIsRefreshing(false);
          }
          
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          setErrors({ general: errorData.error || 'Failed to save names' });
        }
      } catch (error) {
        console.error('Error saving names:', error);
        setErrors({ general: 'Network error. Please try again.' });
      } finally {
        setIsSaving(false);
      }
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
              disabled={isSaving}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isSaving 
                  ? 'bg-indigo-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSaving ? (
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editingInfo.firstName || ''}
                      onChange={(e) => setEditingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        errors.firstName ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editingInfo.lastName || ''}
                      onChange={(e) => setEditingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        errors.lastName ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                {errors.general && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.general}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">
                  {isSaving ? 'Saving...' : isRefreshing ? 'Refreshing...' : displayName}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address <span className="text-gray-500 dark:text-gray-400 text-xs">(Read-only)</span>
            </label>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">{personalInfo.email}</span>
              <LockIcon className="w-3 h-3 text-gray-400 dark:text-gray-500 ml-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};