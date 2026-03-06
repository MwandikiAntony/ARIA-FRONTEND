'use client';

import React from 'react';
import { SOSTriggerCard } from './SOSTriggerCard';
import { ContactsCard } from './ContactsCard';
import { SOSLogCard } from './SOSLogCard';

export const SOSGrid: React.FC = () => {
  return (
    <section className="bg-bg-void border-t border-border px-4 md:px-8 py-12 md:py-16">
      <div className="mb-8 md:mb-10">
        <div className="section-label text-red">Safety System</div>
        <h2 className="section-title">
          Emergency <span className="text-red">SOS</span> Module
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <SOSTriggerCard />
        <ContactsCard />
        <SOSLogCard />
      </div>
    </section>
  );
}; 
