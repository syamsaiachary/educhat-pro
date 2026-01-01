import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-slate-800 overflow-hidden">
      {children}
    </div>
  );
};