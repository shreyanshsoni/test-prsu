import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile - Academic Planner',
  description: 'Create and manage your comprehensive student profile',
};

export default function CustomUserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 