'use client';

import * as React from 'react';
import { CoachMain } from './CoachMain';
import { CoachSidebar } from './CoachSidebar';
import { Tag } from '@/components/ui/Tag';

export const CoachLayout: React.FC = () => {
  return (
    <section className="bg-bg-void border-t border-border px-4 md:px-8 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 md:mb-10">
        <div>
          <div className="section-label text-amber">Coach Mode</div>
          <h2 className="section-title">
            Real-time <span className="text-amber">Performance</span> Coaching
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <Tag color="amber">● INTERVIEW SESSION</Tag>
          <Tag color="green">RECORDING</Tag>
          <span className="font-mono text-sm text-cyan">04:32</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <CoachMain />
        <CoachSidebar />
      </div>
    </section>
  );
};