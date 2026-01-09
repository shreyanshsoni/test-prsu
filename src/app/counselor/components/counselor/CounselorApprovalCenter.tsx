'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ApprovalStudent {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  instituteName: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
  verifiedAt?: string | null;
}

const ITEMS_PER_PAGE = 8;

const CounselorApprovalCenter: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [students, setStudents] = useState<ApprovalStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<ApprovalStudent | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/counselor/approval-students', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching approval students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleApproveReject = async (studentUserId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoadingId(studentUserId);
      const response = await fetch('/api/counselor/approve-student', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUserId, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      await fetchStudents();

      // Refresh navigation badge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pendingApprovalsUpdated'));
      }
      setSelectedStudent(null);
    } catch (err) {
      console.error(`Error ${action}ing student:`, err);
      alert(err instanceof Error ? err.message : `Failed to ${action} student`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesStatus = selectedStatus === 'all' || student.verificationStatus === selectedStatus;
      const matchesSearch =
        term === '' ||
        student.displayName.toLowerCase().includes(term) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [students, searchTerm, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const pendingCount = useMemo(
    () => students.filter((s) => s.verificationStatus === 'pending').length,
    [students]
  );
  const approvedCount = useMemo(
    () => students.filter((s) => s.verificationStatus === 'approved').length,
    [students]
  );
  const rejectedCount = useMemo(
    () => students.filter((s) => s.verificationStatus === 'rejected').length,
    [students]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const renderAvatar = (student: ApprovalStudent) => {
    const initials =
      `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`.trim() ||
      student.displayName.charAt(0) ||
      '?';
    return (
      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
        {initials.toUpperCase()}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
            <p className={`mt-4 ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>Loading students...</p>
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
            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
              Error Loading Students
            </h3>
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-4`}>{error}</p>
            <button
              onClick={fetchStudents}
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
        <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Student Approval Center</h1>
        <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>
          Review and process student applications across all statuses
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-4 border`}>
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{pendingCount}</p>
              <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>Pending Review</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-4 border`}>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{approvedCount}</p>
              <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>Approved</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-4 border`}>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{rejectedCount}</p>
              <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>Rejected</p>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-4 border`}>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{students.length}</p>
              <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-6 border mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-dark-input border-dark-border text-dark-text'
                  : 'bg-white border border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? 'bg-dark-input border-dark-border text-dark-text'
                : 'bg-white border border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      {paginatedStudents.length === 0 ? (
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-12 text-center`}>
          <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>No students match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {paginatedStudents.map((student) => (
            <div
              key={student.userId}
              className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-lg p-4 border hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {renderAvatar(student)}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    {student.displayName}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>{student.instituteName}</p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>Requested</span>
                  <span className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                    {formatDate(student.createdAt)}
                  </span>
                </div>
                {student.verificationStatus === 'approved' && (
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>Verified</span>
                    <span className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                      {formatDate(student.verifiedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                {getStatusBadge(student.verificationStatus)}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className={`flex-1 px-3 py-2 text-xs font-medium ${isDark ? 'text-dark-text bg-dark-border hover:bg-dark-border/80' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'} rounded transition-colors flex items-center justify-center space-x-1`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Details</span>
                </button>
                {student.verificationStatus === 'pending' && (
                  <button
                    onClick={() => handleApproveReject(student.userId, 'approve')}
                    disabled={actionLoadingId === student.userId}
                    className={`flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors ${
                      actionLoadingId === student.userId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-lg p-4 flex items-center justify-between`}>
          <div className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border ${
                isDark
                  ? 'border-dark-border text-dark-text hover:bg-dark-border'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className={isDark ? 'text-dark-text' : 'text-gray-700'}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border ${
                isDark
                  ? 'border-dark-border text-dark-text hover:bg-dark-border'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white'} w-full max-w-md rounded-lg p-6 border`}>
            <div className="flex items-center space-x-3 mb-4">
              {renderAvatar(selectedStudent)}
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                  {selectedStudent.displayName}
                </h3>
                <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'} text-sm`}>{selectedStudent.instituteName}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>Requested</span>
                <span className={isDark ? 'text-dark-text' : 'text-gray-900'}>{formatDate(selectedStudent.createdAt)}</span>
              </div>
              {selectedStudent.verificationStatus === 'approved' && (
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>Verified</span>
                  <span className={isDark ? 'text-dark-text' : 'text-gray-900'}>{formatDate(selectedStudent.verifiedAt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>Status</span>
                {getStatusBadge(selectedStudent.verificationStatus)}
              </div>
            </div>

            {selectedStudent.verificationStatus === 'pending' && (
              <div className="flex space-x-3 mb-3">
                <button
                  onClick={() => handleApproveReject(selectedStudent.userId, 'reject')}
                  disabled={actionLoadingId === selectedStudent.userId}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ${
                    actionLoadingId === selectedStudent.userId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproveReject(selectedStudent.userId, 'approve')}
                  disabled={actionLoadingId === selectedStudent.userId}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors ${
                    actionLoadingId === selectedStudent.userId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Approve
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedStudent(null)}
              className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
                isDark ? 'bg-dark-border text-dark-text hover:bg-dark-border/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorApprovalCenter;

