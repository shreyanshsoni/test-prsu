'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CounsellorRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/counselor');
  }, [router]);
  
  return null;
} 