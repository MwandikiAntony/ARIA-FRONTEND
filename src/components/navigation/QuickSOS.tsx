import React from 'react';
import { Button } from '@/components/ui/Button';

export const QuickSOS: React.FC = () => {
  return (
    <>
      <Button variant="danger" fullWidth className="!py-3">
        🆘 SOS — EMERGENCY
      </Button>
      <p className="font-mono text-[10px] text-text-muted mt-2.5 text-center">
        Voice trigger: &quot;Call emergency&quot;
        <br />
        GPS + SMS dispatch ready
      </p>
    </>
  );
}; 
