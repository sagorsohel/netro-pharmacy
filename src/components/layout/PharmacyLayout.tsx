import React from 'react';
import { Outlet } from 'react-router-dom';
import { PharmacySidebar } from './PharmacySidebar';
import { PharmacyHeader } from './PharmacyHeader';

export const PharmacyLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-dark flex flex-col gap-4 font-sans select-none p-4 sm:p-5">
      {/* 1. Top Navigation Bar */}
      <PharmacyHeader />

      {/* 2. Main Content Canvas: Fixed Sidebar + Scrollable Content */}
      <div className="flex-1 flex gap-4 lg:gap-5 items-stretch min-h-0 overflow-hidden">
        {/* Left Fixed Floating Rounded Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <PharmacySidebar />
        </div>

        {/* Right Scrollable Dashboard Canvas */}
        <main
          className="flex-1 h-full overflow-y-auto no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
