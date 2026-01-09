'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface StudentContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultSchoolName?: string;
}

const StudentContactFormModal: React.FC<StudentContactFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultSchoolName = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolName: defaultSchoolName,
    countryCode: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose, isSubmitting]);

  // Reset form and status when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ 
        name: '', 
        email: '', 
        schoolName: defaultSchoolName, 
        countryCode: '', 
        phone: '', 
        message: '' 
      });
      setSubmitStatus(null);
      setSubmitMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, defaultSchoolName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCountryCodeDisplay = () => {
    if (!formData.countryCode) return '';
    return formData.countryCode.replace('+', '');
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits, max 3 digits, no + allowed
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 3);
    const valueWithPlus = digitsOnly ? '+' + digitsOnly : '';
    setFormData({
      ...formData,
      countryCode: valueWithPlus
    });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Call the API endpoint
      const response = await fetch('/api/student-contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          schoolName: formData.schoolName,
          countryCode: formData.countryCode || null,
          phone: formData.phone || null,
          message: formData.message || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit form');
      }

      // Success - Close modal immediately and trigger toast
      setFormData({ name: '', email: '', schoolName: defaultSchoolName, countryCode: '', phone: '', message: '' });
      setSubmitStatus(null);
      setSubmitMessage('');
      setIsSubmitting(false);
      
      // Close modal and show success
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            Fill out the form below and we&apos;ll get back to you soon.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School Name *
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                readOnly
                disabled={true}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                placeholder="Your school or institute name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-gray-500 dark:text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 dark:text-white pointer-events-none font-medium z-10">
                    +
                  </span>
                  <input
                    type="text"
                    id="countryCode"
                    name="countryCode"
                    value={getCountryCodeDisplay()}
                    onChange={handleCountryCodeChange}
                    maxLength={3}
                    disabled={isSubmitting}
                    className="w-24 pl-6 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message <span className="text-gray-500 dark:text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tell us how we can help you..."
              />
            </div>

            {/* Error Message Only */}
            {submitMessage && submitStatus === 'error' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">
                  {submitMessage}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentContactFormModal;
