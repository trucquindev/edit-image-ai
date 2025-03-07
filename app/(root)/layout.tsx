import MobileNav from '@/components/shared/MobileNav';
import SideBar from '@/components/shared/SideBar';
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <SideBar />
      <MobileNav />
      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>
      <Toaster />
    </main>
  );
};

export default Layout;
