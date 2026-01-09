'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, User, Building2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface PendingStudent {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  instituteId: number;
  instituteName: string;
  verificationStatus: string;
  createdAt: string;
}

export default function PendingApprovals() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/counselor/pending-students', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending students');
      }

      const data = await response.json();
      setPendingStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching pending students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pending students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (studentUserId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingIds(prev => new Set(prev).add(studentUserId));
      
      const response = await fetch('/api/counselor/approve-student', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentUserId,
          action,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      // Remove the student from the list
      setPendingStudents(prev => prev.filter(s => s.userId !== studentUserId));
      
      // Dispatch custom event to refresh navigation count
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pendingApprovalsUpdated'));
      }
    } catch (err) {
      console.error(`Error ${action}ing student:`, err);
      alert(err instanceof Error ? err.message : `Failed to ${action} student`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentUserId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
            <p className={`mt-4 ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>Loading pending approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-8`}>
          <div className="text-center">
            <XCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
              Error Loading Approvals
            </h3>
            <p className={`mb-4 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={fetchPendingStudents}
              className={`px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
          Pending Student Approvals
        </h1>
        <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
          Review and approve or reject student registration requests from your institute
        </p>
      </div>

      {pendingStudents.length === 0 ? (
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-12`}>
          <div className="text-center">
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
              No Pending Approvals
            </h3>
            <p className={isDark ? 'text-dark-muted' : 'text-gray-600'}>
              All student requests have been processed.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingStudents.map((student) => {
            const isProcessing = processingIds.has(student.userId);
            
            return (
              <div
                key={student.userId}
                className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-6 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <User className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                          {student.displayName}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                          {student.instituteName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                          Requested: {formatDate(student.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 ml-4">
                    <button
                      onClick={() => handleApproveReject(student.userId, 'approve')}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        isProcessing
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleApproveReject(student.userId, 'reject')}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        isProcessing
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

