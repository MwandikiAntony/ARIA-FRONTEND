import React from 'react';
import { ContactRow } from './ContactRow';
import { Button } from '@/components/ui/Button';

const contacts = [
  {
    id: '1',
    initials: 'MJ',
    name: 'Mary Johnson',
    role: 'Primary Contact · Mother',
    color: 'from-blue-700 to-blue-900',
    status: 'active' as const,
  },
  {
    id: '2',
    initials: 'RJ',
    name: 'Robert Johnson',
    role: 'Secondary · Father',
    color: 'from-purple-800 to-purple-950',
    status: 'active' as const,
  },
  {
    id: '3',
    initials: '🏥',
    name: 'Emergency Services',
    role: '911 · Auto-dispatch',
    color: 'from-orange-700 to-orange-800',
    status: 'standby' as const,
  },
];

export const ContactsCard: React.FC = () => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 md:p-6">
      <div className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-4">
        // Emergency Contacts
      </div>
      
      <div className="flex flex-col">
        {contacts.map((contact) => (
          <ContactRow key={contact.id} {...contact} />
        ))}
      </div>

      <div className="mt-4">
        <Button 
          variant="ghost" 
          fullWidth 
          className="!py-2.5 !text-xs border-cyan/20"
        >
          + Add Emergency Contact
        </Button>
      </div>
    </div>
  );
}; 
