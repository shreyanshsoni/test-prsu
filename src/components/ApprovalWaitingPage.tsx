'use client';

import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentContactFormModal from './StudentContactFormModal';
import SuccessToast from './SuccessToast';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalWaitingPageProps {
  instituteName: string;
  fullName: string;
  approvalStatus: ApprovalStatus;
}

export default function ApprovalWaitingPage({
  instituteName,
  fullName,
  approvalStatus
}: ApprovalWaitingPageProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<ApprovalStatus>(approvalStatus);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Poll for status updates if pending (only when status is pending)
  useEffect(() => {
    if (currentStatus !== 'pending') {
      return; // Don't poll if not pending
    }
    
    console.log('Starting approval status polling (every 30 seconds)');
    let isPolling = true;
    
    const interval = setInterval(async () => {
      if (!isPolling) return;
      
      try {
        const response = await fetch('/api/user-profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          const newStatus = profile?.verification_status || 'pending';
          
          console.log('Polling check - Current:', currentStatus, 'New:', newStatus);
          
          if (newStatus !== currentStatus && isPolling) {
            console.log('Status changed! Updating to:', newStatus);
            setCurrentStatus(newStatus as ApprovalStatus);
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('Stopping approval status polling');
      isPolling = false;
      clearInterval(interval);
    };
  }, [currentStatus]);

  // Auto-redirect if approved
  useEffect(() => {
    if (currentStatus === 'approved') {
      const timer = setTimeout(() => {
        router.push('/students');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, router]);

  const getStatusContent = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          title: 'Approval Pending',
          message: 'Your account is under review by institute administrators',
          description: 'This usually takes 24-48 hours. You will be notified once your account is approved.',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Application Rejected',
          message: 'Your application was not approved',
          description: 'Please contact your institute administrator for more information or try registering again with the correct details.',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
          title: 'Account Approved!',
          message: 'Your account has been approved',
          description: 'Redirecting you to your dashboard...',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          title: 'Approval Pending',
          message: 'Your account is under review',
          description: '',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
        };
    }
  };

  const statusContent = getStatusContent(currentStatus);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/pexels-george-pak-7972949.jpg)' }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-white/40 dark:bg-gray-900/40" />
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img 
                src="/P_Logo.png" 
                alt="PRSU Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              Hello, {fullName}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-gray-300">{instituteName}</p>
          </div>

          <div className={`${statusContent.bgColor} border ${statusContent.borderColor} rounded-xl p-6 mb-6`}>
            <div className="flex justify-center mb-4">
              {statusContent.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              {statusContent.title}
            </h3>
            <p className="text-slate-700 dark:text-gray-200 text-center font-medium mb-3">
              {statusContent.message}
            </p>
            <p className="text-sm text-slate-600 dark:text-gray-300 text-center leading-relaxed">
              {statusContent.description}
            </p>
          </div>

          {currentStatus === 'pending' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">What happens next?</p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Institute administrators will review your application</li>
                <li>• You will receive a notification once approved</li>
                <li>• Check back here to see your status</li>
              </ul>
            </div>
          )}

          {currentStatus === 'rejected' && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/approval')}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-800 dark:text-gray-200 text-sm mt-6 font-medium drop-shadow-sm">
          Need help?{' '}
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            Contact Us
          </button>
        </p>
        
        <StudentContactFormModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSuccess={() => {
            setIsContactModalOpen(false);
            setShowSuccessToast(true);
          }}
          defaultSchoolName={instituteName}
        />
        
        <SuccessToast 
          isOpen={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        />
      </div>
    </div>
  );
}

